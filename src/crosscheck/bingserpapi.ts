import { Document } from "@langchain/core/documents";
import { CallbackManagerForRetrieverRun } from "@langchain/core/callbacks/manager";
import {
  BaseRetriever,
  type BaseRetrieverInput,
} from "@langchain/core/retrievers";
import { getEnvironmentVariable } from "@langchain/core/utils/env";

export type BingNewsAPIRetrieverFields = BaseRetrieverInput & {
  k?: number;
  kwargs?: Record<string, unknown>;
  apiKey?: string;
};

export class BingNewsAPIRetriever extends BaseRetriever {
  static lc_name() {
    return "BingNewsAPIRetriever";
  }

  get lc_namespace(): string[] {
    return ["langchain", "retrievers", "bing_news_api"];
  }

  k = 10;

  kwargs: Record<string, unknown> = {};

  apiKey?: string;

  constructor(fields?: BingNewsAPIRetrieverFields) {
    super(fields);
    this.k = fields?.k ?? this.k;
    this.kwargs = fields?.kwargs ?? this.kwargs;
    this.apiKey = fields?.apiKey ?? getEnvironmentVariable("BING_API_KEY");
    if (this.apiKey === undefined) {
      throw new Error(
        `No Bing API key found. Either set an environment variable named "BING_API_KEY" or pass an API key as "apiKey".`
      );
    }
  }

  async _getRelevantDocuments(
    query: string,
    _runManager?: CallbackManagerForRetrieverRun
  ): Promise<Document[]> {
    const headers = { "Ocp-Apim-Subscription-Key": this.apiKey };
    const params = { q: query, count: this.k };
    const searchUrl = new URL("https://api.bing.microsoft.com/v7.0/news/search");

    Object.entries(params).forEach(([key, value]) => {
      searchUrl.searchParams.append(key, value.toString());
    });

    const response = await fetch(searchUrl, { headers });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(
        `Request failed with status code ${response.status}: ${json.error}`
      );
    }
    if (!Array.isArray(json.value)) {
      throw new Error(`Could not parse Bing News results. Please try again.`);
    }
    const docs: Document[] = json.value.map((result: any) => {
      const pageContent = result.description;
      const metadata = {
        title: result.name,
        source: result.url,
      };
      return new Document({ pageContent, metadata });
    });
    return docs;
  }
}
