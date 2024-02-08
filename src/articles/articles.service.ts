// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class ArticlesService {}

import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';

@Injectable()
export class ArticlesService {

    private articles = [
        {
            link: 'https://www.example.com/article-1',
            title: 'Article 1',
            content: 'This is the content for article 1',
            datePublished: '2021-01-01',
        },
        {
            link: 'https://www.example.com/article-2',
            title: 'Article 2',
            content: 'This is the content for article 2',
            datePublished: '2021-01-02',
        },
    ];

    async findArticleByLink(link: string): Promise<any> {
        // Logic to query Cosmos DB and find article by link
        return this.articles.find((article) => article.link === link);
    }

    async updateArticle(link: String, updatedData: any): Promise<any> {
        // Logic to update article in Cosmos DB
        const articleIndex = this.articles.findIndex((article) => article.link === link);
        this.articles[articleIndex] = updatedData;

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
            return this.createArticle(createArticleDto);
        }
    }

    async getAllArticles(): Promise<any> {
        return this.articles;
    }
}
