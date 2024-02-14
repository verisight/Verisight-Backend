// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class ArticlesService {}

import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Articles } from './schemas/articles.schema';
import mongoose from 'mongoose';

@Injectable()
export class ArticlesService {

    constructor(
        @InjectModel(Articles.name)
        private articleModel: mongoose.Model<Articles>,
    ) {}

    async findArticleByLink(link1: string): Promise<any> {
        //Find the article by link from the MongoDB
        //Check if MongoDB is connected
        if (!this.articleModel) {
            throw new Error('MongoDB not connected');
        }
        const response = await this.articleModel.findOne({ link: link1 });
        if (!response) {
            console.log('Article not found');
        }
        return response;
    }

    async findArticleByDto(article: CreateArticleDto): Promise<any> {
        //Find the article by link from the MongoDB
        //Check if MongoDB is connected
        if (!this.articleModel) {
            throw new Error('MongoDB not connected');
        }
        const response = await this.articleModel.findOne({ link: article.link });
        if (!response) {
            console.log('Article not found');
        }
        return response;
    }

    async updateArticle(link: String, article: Articles): Promise<Articles> {
        // Logic to update article in MongoDB
        const updatedArticle = await this.articleModel.findOneAndUpdate({ link: link }, article, { new: true , runValidators: true  });
        return updatedArticle;
    }

    async updateArticlePrediction(link: String, prediction: number): Promise<any> {
        // Logic to update article prediction in MongoDB
        const updatedArticle = await this.articleModel.findOneAndUpdate({ link: link }, { prediction: prediction }, { new: true , runValidators: true  });
        return updatedArticle;
    }

    async createArticle(article : Articles): Promise<any> {
        // Logic to create article in MongoDB
        //Check if MongoDB is connected
        if (!this.articleModel) {
            throw new Error('MongoDB not connected');
        }
        await this.articleModel.create(article);
    }

    async handleArticlePost(article : Articles): Promise<void> {
        if (!article.link && !article.title && !article.content && !article.datePublished) {
            throw new Error('Invalid article data');
        }
        
        const existingArticle = await this.findArticleByLink(article.link);

        if (existingArticle) {
            console.log("Article Link exists in the DB")
            // Article exists, check if date published is different
            if (existingArticle.datePublished !== article.datePublished) {
                console.log("Article Link exists but date is updated")
                this.updateArticle(existingArticle.link, article);
                this.incongruenceCheck(article);
                return this.findArticleByLink(article.link)
            } else {
                return existingArticle
            }
        } else {
            console.log("Article Link does not exist")
            // Article doesn't exist, create new article
            this.createArticle(article);
            this.incongruenceCheck(article);
            return this.findArticleByLink(article.link)
        }
    }

    async getAllArticles(): Promise<Articles[]> {
        const article = await this.articleModel.find();
        return article;
    }

    async getArticle(link: string): Promise<any> {
        // Logic to get article from Cosmos DB
        if (!link) {
            throw new Error('Invalid article link');
        }
        const response = await this.articleModel.findOne({ link: link });
        return response;
    }
    
    async incongruenceCheck(article: Articles): Promise<any> {
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
