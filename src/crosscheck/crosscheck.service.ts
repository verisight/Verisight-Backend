import { Injectable } from '@nestjs/common';
import { BingNewsAPIRetriever } from 'src/crosscheck/bingserpapi'
// import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api";
// import { AzureChatOpenAI } from '@langchain/azure-openai';
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Document } from '@langchain/core/documents';
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableMap, RunnablePassthrough } from "@langchain/core/runnables";



@Injectable()
export class CrosscheckService {
  //using lancgchain bingserpapi and langchain citations to get citations
  async getCrosscheck(article: { headline: string, body: string }): Promise<any> {
    const llm = new ChatOpenAI({
      temperature: 0.5,
      azureOpenAIApiKey: "59d96e10c65d4503943ecfb411257eba",
      azureOpenAIApiVersion: "2023-12-01-preview",
      azureOpenAIApiDeploymentName: "Verisight-gpt35-turbo-1106",
      azureOpenAIBasePath: "https://verisightgptapi.openai.azure.com/openai/deployments",
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


    const formatDocs = (input: Record<string, any>): string => {
      const { docs } = input;

      return "\n\n" + docs.map((doc: Document) => `Article Headline: ${doc.metadata.title}\nArticle Snippet: ${doc.pageContent}`).join("\n\n");
    }

    const answerChain = prompt.pipe(llm).pipe(new StringOutputParser())

    const map = RunnableMap.from({
      question: new RunnablePassthrough(),
      docs: retriever,
    })

    const chain = map.assign({ context: formatDocs }).assign({ answer: answerChain }).pick(["answer", "docs"])
    const question = `Headline: '${article.headline}' Body: '${article.body}'`
    const result = await chain.invoke(question)
    return result
  }
}
