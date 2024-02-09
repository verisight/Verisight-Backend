// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class ArticlesService {}

import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';

@Injectable()
export class ArticlesService {

    public articles = [
        {
            link: 'https://www.example.com/article-1',
            title: 'Article 1',
            content: 'This is the content for article 1',
            datePublished: '2021-01-01',
            prediction: 0
        },
        {
            link: 'https://www.example.com/article-2',
            title: 'Article 2',
            content: 'This is the content for article 2',
            datePublished: '2021-01-02',
            prediction: 0
        },
    ];

    //Make the article array public

    async findArticleByLink(link: string): Promise<any> {
        // Logic to query Cosmos DB and find article by link
        return this.articles.find((article) => article.link === link);
    }

    async updateArticle(link: String, updatedData: any): Promise<any> {
        // Logic to update article in Cosmos DB
        const articleIndex = this.articles.findIndex((article) => article.link === link);
        this.articles[articleIndex] = updatedData;

    }

    async updateArticlePrediction(link: String, prediction: number): Promise<any> {
        // Logic to update article prediction in Cosmos DB
        const articleIndex = this.articles.findIndex((article) => article.link === link);
        this.articles[articleIndex].prediction = prediction;
    }

    async createArticle(createArticleDto: CreateArticleDto): Promise<any> {
        // Logic to create article in Cosmos DB
        this.articles.push(createArticleDto);
        return this.articles;
    }

    async handleArticlePost(createArticleDto: CreateArticleDto): Promise<void> {
        if (!createArticleDto.link || !createArticleDto.title || !createArticleDto.content || !createArticleDto.datePublished) {
            throw new Error('Invalid article data');
        }
        const existingArticle = await this.findArticleByLink(createArticleDto.link);

        if (existingArticle) {
            // Article exists, check if date published is different
            if (existingArticle.datePublished !== createArticleDto.datePublished) {
                return this.updateArticle(existingArticle.link, createArticleDto);
            }
        } else {
            // Article doesn't exist, create new article
            this.createArticle(createArticleDto);
            this.incongruenceCheck(createArticleDto);
            this.getAllArticles();
        }
    }

    async getAllArticles(): Promise<any> {
        return this.articles;
    }
    
    async incongruenceCheck(article: any): Promise<any> {
        // Logic to check if article data is incongruent
        if (article.title && article.content) {
            //Call a POST Function to Azure API for ML Model
            const requestBody = {
                "headline": article.title,
                "body": article.content
            } ;

            const requestHeaders = new Headers({"Content-Type" : "application/json"});

            // Replace this with the primary/secondary key or AMLToken for the endpoint
            const apiKey = "nS0cCwq6HjzabpBKJ9lu0MqrSCvCBdbW";
            if (!apiKey)
            {
                throw new Error("A key should be provided to invoke the endpoint");
            }
            requestHeaders.append("Authorization", "Bearer " + apiKey)

            // This header will force the request to go to a specific deployment.
            // Remove this line to have the request observe the endpoint traffic rules
            requestHeaders.append("azureml-model-deployment", "stance-detect-1");

            const url = "https://incongruence-detect.eastus.inference.ml.azure.com/score";

            fetch(url, {
            method: "POST",
            body: JSON.stringify(requestBody),
            headers: requestHeaders
            })
                .then(async (response) => {
                    if (response.ok) {
                        const jsonResponse = await response.json();
                        this.updateArticlePrediction(article.link, jsonResponse.prediction);
                        return jsonResponse;
                    } else {
                        // Print the headers - they include the request ID and the timestamp, which are useful for debugging the failure
                        console.debug(...response.headers);
                        console.debug(response.body)
                        throw new Error("Request failed with status code" + response.status);
                    }
                })
                .then((json) => console.log(json))
                .catch((error) => {
                    console.error(error)
                });
        }

    }
    
}
