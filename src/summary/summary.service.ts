import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from '../articles/dto/create-article.dto';
import { AzureKeyCredential } from '@azure/openai';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class SummaryService {
  constructor(private configService: ConfigService) { }

  async createSummary(createArticleDto: CreateArticleDto): Promise<any> {
    const { OpenAIClient } = require('@azure/openai');

    //Initialise the completion variable
    let completion = 'Hello';

    const endpoint = this.configService.get('SUMMARY_ENDPOINT');
    const key = this.configService.get('CROSSCHECK_API_KEY');
    const deploymentName = this.configService.get(
      'SUMMARY_API_DEPLOYMENT_NAME',
    );


    const textToSummarize = createArticleDto.content;

    completion = await main();

    async function main() {
      // const client = new OpenAIClient(endpoint, new AzureKeyCredential(key));

      // const summarizationPrompt = [
      //   `Provide a summary of the text below that captures its main idea.
      //       ${textToSummarize}`,
      // ];

      // console.log(`Input Received`);

      // const { choices } = await client.getCompletions(
      //   deploymentName,
      //   summarizationPrompt,
      //   {
      //     maxTokens: 250,
      //     temperature: 0.5,
      //     topP: 1,
      //     frequencyPenalty: 0,
      //     presencePenalty: 0,
      //     bestOf: 1,
      //   },
      // );
      // completion = choices[0].text;
      // console.log(`Summarization: ${completion}`);
      // //String format on the completion until any ` character is found
      // return completion.trim();

      const llm = new OpenAI({
        apiKey: key,
        baseURL: endpoint,
        defaultQuery: { 'api-version': '2023-09-15-preview' },
        defaultHeaders: { 'api-key': key }
      });

      const completion = llm.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that for the article provided provides a summary that captures its main idea as a json. Make the key summary',
          }, {
            role: 'user',
            content: textToSummarize
          },
        ],
        model: deploymentName,
        response_format: { type: "json_object" },
      });

      const summary = (await completion).choices[0].message.content;
      const summaryJSON = JSON.parse(summary);
      return summaryJSON.summary;

    }

    main().catch((err) => {
      console.error('The sample encountered an error:', err);
    });

    return completion.trim();
  }
}
