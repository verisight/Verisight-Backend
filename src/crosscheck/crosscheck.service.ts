import { Injectable } from '@nestjs/common';
// import { BingNewsAPIRetriever } from './bingserpapi'
import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api";
// import { AzureChatOpenAI } from '@langchain/azure-openai';
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Document } from '@langchain/core/documents';
// import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableMap, RunnablePassthrough } from "@langchain/core/runnables";
import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import { formatToOpenAITool } from "@langchain/openai";
import { JsonOutputKeyToolsParser } from "langchain/output_parsers";
import { CreateArticleDto } from 'src/articles/dto/create-article.dto';


// Define the tool to be used in the chain
class CitedAnswer extends StructuredTool {
  name = "cited_answer"; // name of the tool

  description = "Answer the user question based only on the given sources, and cite the sources used."; // description of the tool

  // define the schema for the tool
  schema = z.object({
    answer: z.string().describe("The answer to the user question, which is based only on the given sources."),
    citations: z.array(z.number()).describe("The integer IDs of the SPECIFIC sources which justify the answer.")
  });

  constructor() {
    super();
  }

  _call(input: z.infer<typeof this["schema"]>): Promise<string> {
    return Promise.resolve(JSON.stringify(input, null, 2));
  }
}


@Injectable()
export class CrosscheckService {
  //using lancgchain bingserpapi and langchain citations to get citations
  async getCrosscheck(article: CreateArticleDto): Promise<any> {


    const asOpenAITool = formatToOpenAITool(new CitedAnswer());
    const tools = [asOpenAITool];

    

    const llm = new ChatOpenAI({
      temperature: 0.5,
      azureOpenAIApiKey: "59d96e10c65d4503943ecfb411257eba",
      azureOpenAIApiVersion: "2023-12-01-preview",
      azureOpenAIApiDeploymentName: "Verisight-gpt35-turbo-1106",
      azureOpenAIBasePath: "https://verisightgptapi.openai.azure.com/openai/deployments",
    });

    // bind the tool to the llm and set the tool_choice to the OpenAI tool
    const llmWithTool = llm.bind({
      tools: tools,
      tool_choice: asOpenAITool
    });

    // set up the retriever
    // const retriever = new BingNewsAPIRetriever({
    //   apiKey: "e1af43a334044d9d9880df246cd8aec4",
    //   k: 10,
    // })

    const retriever = new TavilySearchAPIRetriever({
        apiKey: "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",
        k: 6,
    })

    // set up the prompt
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "As an AI assistant, your task is to analyze a given news article, including its headline and body. Cross-reference the content with snippets from various web sources to identify any inconsistencies. Should discrepancies arise, detail the specific differences. If no inconsistencies are found, confirm the article’s consistency with other reports on the subject. \n\nHere are the web articles:{context}"],
      ["human", "{question}"],
    ])

    // set up the output parser
    const outputParser = new JsonOutputKeyToolsParser({ keyName: "cited_answer", returnSingle: true });

    // format the docs (web article) to a string
    const formatDocsWithId = (docs: Array<Document>): string => {
      return "\n\n" + docs.map((doc: Document, idx: number) => `Source ID: ${idx}\nArticle title: ${doc.metadata.title}\nArticle Snippet: ${doc.pageContent}`).join("\n\n");
    }
    // subchain for generating an answer once we've done retrieval
    const answerChain = prompt.pipe(llmWithTool).pipe(outputParser);
    const map = RunnableMap.from({
      question: new RunnablePassthrough(),
      docs: retriever,
    })
    // complete chain that calls the retriever -> formats docs to string -> runs answer subchain -> returns just the answer and retrieved docs.
    const chain = map
      .assign({ context: (input: { docs: Array<Document> }) => formatDocsWithId(input.docs) })
      .assign({ cited_answer: answerChain })
      .pick(["cited_answer", "docs"])
    
    const question = `Headline: '${article.title}' Body: '${article.content}'`
    const result = await chain.invoke(question)
    return result


  }


}