import { Injectable } from '@nestjs/common';
import { BingNewsAPIRetriever } from 'src/crosscheck/bingserpapi'
// import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api";
// import { AzureChatOpenAI } from '@langchain/azure-openai';
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Document } from '@langchain/core/documents';
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableMap, RunnablePassthrough } from "@langchain/core/runnables";
import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import { formatToOpenAITool } from "@langchain/openai";
import { JsonOutputKeyToolsParser } from "langchain/output_parsers";




class CitedAnswer extends StructuredTool {
  name = "cited_answer";

  description = "Answer the user question based only on the given sources, and cite the sources used.";

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
  async getCrosscheck(article: { headline: string, body: string }): Promise<any> {

    const asOpenAITool = formatToOpenAITool(new CitedAnswer());
    const tools = [asOpenAITool];

    

    const llm = new ChatOpenAI({
      temperature: 0.5,
      azureOpenAIApiKey: "59d96e10c65d4503943ecfb411257eba",
      azureOpenAIApiVersion: "2023-12-01-preview",
      azureOpenAIApiDeploymentName: "Verisight-gpt35-turbo-1106",
      azureOpenAIBasePath: "https://verisightgptapi.openai.azure.com/openai/deployments",
    });

    const llmWithTool = llm.bind({
      tools: tools,
      tool_choice: asOpenAITool
    });

    const retriever = new BingNewsAPIRetriever({
      apiKey: "e1af43a334044d9d9880df246cd8aec4",
      k: 3,
    })

    // const retriever = new TavilySearchAPIRetriever({
    //     apiKey: "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",
    //     k: 6,
    // })

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You're a helpful AI assistant. Given a headline, body, and snippets from various web news articles, determine if there are any discrepancies between the provided news article and the information found in the other articles. If you can't find any discrepencies, just say you couldn't find any discrepencies and say the article is consistent with the other articles on the same topic.\n\nHere are the web articles:{context}"],
      ["human", "{question}"],
    ])

    const outputParser = new JsonOutputKeyToolsParser({ keyName: "cited_answer", returnSingle: true });

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
    
    const question = `Headline: '${article.headline}' Body: '${article.body}'`
    const result = await chain.invoke(question)
    return result


  }


}