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
            prediction: 0
        },
    ]

    async createSummary(createArticleDto: CreateArticleDto): Promise<void> {
        const { OpenAIClient } = require("@azure/openai");

        async function main(){
            const endpoint = "https://verisightgptapi2.openai.azure.com/";
            const key = "b9bae2eb7b0f41fb865c2a03543cbeeb";
            const client = new OpenAIClient(endpoint, new AzureKeyCredential(key));

            this.articles.push(createArticleDto);

            const textToSummarize = createArticleDto.content;

            const summarizationPrompt = [`
                Summarize the following text without losing the context:

                Text:
                """"""
                ${textToSummarize}
                """"""

                Summary:
            `];

            console.log(`Input: ${summarizationPrompt}`);

            const deploymentName = "Verisight-gpt-35-turbo-0301";

            const { choices } = await client.getCompletions(deploymentName, summarizationPrompt, {
                maxTokens: 64
            });
            const completion = choices[0].text;
            console.log(`Summarization: ${completion}`);
        }

        main().catch((err) => {
        console.error("The sample encountered an error:", err);
        });
        
    }
}
