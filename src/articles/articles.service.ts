import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Articles } from './schemas/articles.schema';
import mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Articles.name)
    private articleModel: mongoose.Model<Articles>,
    private configService: ConfigService,
  ) {}

  /**
   * Find an article by its link.
   * @param link1 - The link of the article.
   * @returns The found article.
   * @throws Error if MongoDB is not connected.
   */
  async findArticleByLink(link1: string): Promise<any> {
    if (!this.articleModel) {
      throw new Error('MongoDB not connected');
    }
    const response = await this.articleModel.findOne({ link: link1 });
    if (!response) {
      console.log('Article not found');
    }
    return response;
  }

  /**
   * Find an article by its DTO.
   * @param article - The DTO of the article.
   * @returns The found article.
   * @throws Error if MongoDB is not connected.
   */
  async findArticleByDto(article: CreateArticleDto): Promise<any> {
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

  /**
   * Update an article.
   * @param link - The link of the article to update.
   * @param article - The updated article object.
   * @returns The updated article.
   */
  async updateArticle(link: String, article: Articles): Promise<Articles> {
    // Logic to update article in MongoDB
    const updatedArticle = await this.articleModel.findOneAndUpdate(
      { link: link },
      article,
      { new: true, runValidators: true },
    );
    return updatedArticle;
  }

  /**
   * Update the prediction of an article.
   * @param link - The link of the article to update.
   * @param prediction - The new prediction value.
   * @returns The updated article.
   */
  async updateArticlePrediction(
    link: String,
    prediction: number,
  ): Promise<any> {
    const updatedArticle = await this.articleModel.findOneAndUpdate(
      { link: link },
      { prediction: prediction },
      { new: true, runValidators: true },
    );
    return updatedArticle;
  }

  /**
   * Create a new article.
   * @param article - The article object to create.
   */
  async createArticle(article: Articles): Promise<any> {
    if (!this.articleModel) {
      throw new Error('MongoDB not connected');
    }
    await this.articleModel.create(article);
  }

  /**
   * Handle the post request for an article.
   * @param article - The article object to handle.
   * @returns The handled article.
   * @throws Error if the article data is invalid.
   */
  async handleArticlePost(article: Articles): Promise<any> {
    if (
      !article.link &&
      !article.title &&
      !article.content &&
      !article.datePublished
    ) {
      throw new Error('Invalid article data');
    }

    const existingArticle = await this.findArticleByLink(article.link);

    if (existingArticle) {
      console.log('Article Link exists in the DB');
      // Article exists, check if date published is different
      if (existingArticle.datePublished !== article.datePublished) {
        console.log('Article Link exists but date is updated');
        await this.updateArticle(existingArticle.link, article);
        await this.incongruenceCheck(article);
        return this.findArticleByLink(article.link);
      } else {
        return existingArticle;
      }
    } else {
      console.log('Article Link does not exist');
      // Article doesn't exist, create new article
      await this.createArticle(article);
      await this.incongruenceCheck(article);
      return this.findArticleByLink(article.link);
    }
  }

  /**
   * Get all articles.
   * @returns An array of articles.
   */
  async getAllArticles(): Promise<Articles[]> {
    const article = await this.articleModel.find();
    return article;
  }

  /**
   * Get an article by its link.
   * @param link - The link of the article.
   * @returns The found article.
   * @throws Error if the article link is invalid.
   */
  async getArticle(link: string): Promise<any> {
    if (!link) {
      throw new Error('Invalid article link');
    }
    const response = await this.articleModel.findOne({ link: link });
    return response;
  }

  /**
   * Perform an incongruence check on an article.
   * @param article - The article to perform the check on.
   * @returns The updated article.
   * @throws Error if a key is not provided to invoke the endpoint.
   */
  async incongruenceCheck(article: Articles): Promise<any> {
    if (article.title && article.content) {
      //Call a POST Function to Azure API for ML Model
      const requestBody = {
        headline: article.title,
        body: article.content,
      };

      const requestHeaders = new Headers({
        'Content-Type': 'application/json',
      });

      // Replace this with the primary/secondary key or AMLToken for the endpoint
      const apiKey = this.configService.get<string>('INCONGRUENCE_API_KEY');
      if (!apiKey) {
        throw new Error('A key should be provided to invoke the endpoint');
      }
      requestHeaders.append('Authorization', 'Bearer ' + apiKey);

      // This header will force the request to go to a specific deployment.
      // Remove this line to have the request observe the endpoint traffic rules
      requestHeaders.append('azureml-model-deployment', 'stance-detect-1');

      const url = this.configService.get<string>('INCONGRUENCE_ENDPOINT');

      await fetch(url, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: requestHeaders,
      })
        .then(async (response) => {
          if (response.ok) {
            const jsonResponse = await response.json();
            const updatedArticle = await this.updateArticlePrediction(
              article.link,
              jsonResponse.prediction,
            );
            return updatedArticle;
          } else {
            // Print the headers - they include the request ID and the timestamp, which are useful for debugging the failure
            console.debug(...response.headers);
            console.debug(response.body);
            throw new Error(
              'Request failed with status code' + response.status,
            );
          }
        })
        .then((json) => console.log(json))
        .catch((error) => {
          console.error(error);
        });
    }
  }
}
