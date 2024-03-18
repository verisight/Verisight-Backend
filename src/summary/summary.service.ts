import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from '../articles/dto/create-article.dto';
import { AzureKeyCredential } from '@azure/openai';

@Injectable()
export class SummaryService {
  private articles = [
    {
      link: 'https://www.example.com/article-1',
      title: 'Article 1',
      content: 'This is the content for article 1',
      datePublished: '2021-01-01',
      prediction: 0,
    },
  ];

  async createSummary(createArticleDto: CreateArticleDto): Promise<any> {
    const { OpenAIClient } = require('@azure/openai');

    //Initialise the completion variable
    let completion = 'Hello';

    this.articles.push(createArticleDto);

    //Remove any \" from the content

    const textToSummarize = createArticleDto.content;

    completion = await main();

    async function main() {
      const endpoint = 'https://verisightgptapi2.openai.azure.com/';
      const key = 'b9bae2eb7b0f41fb865c2a03543cbeeb';
      const client = new OpenAIClient(endpoint, new AzureKeyCredential(key));

      const summarizationPrompt = [
        `Provide a summary of the text below that captures its main idea.
            ${textToSummarize}`,
      ];

      console.log(`Input: ${summarizationPrompt}`);

      const deploymentName = 'Verisight-gpt-35-turbo-instruct';

      const { choices } = await client.getCompletions(
        deploymentName,
        summarizationPrompt,
        {
          maxTokens: 250,
          temperature: 0.5,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0,
          bestOf: 1,
        },
      );
      completion = choices[0].text;
      console.log(`Summarization: ${completion}`);
      //String format on the completion until any ` character is found
      return completion;
    }

    main().catch((err) => {
      console.error('The sample encountered an error:', err);
    });

    return completion.trim();
  }
}
