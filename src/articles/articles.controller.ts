// import { Controller, Post } from '@nestjs/common';

// @Controller('articles')
// export class ArticlesController {
//     /*
//     @POST for creating a new article
//     */

//     @Post()
//     create() {
//         return 'This action adds a new article';
//     }
// }

// articles.controller.ts

import { Controller, Post, Body, Get } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Articles } from './schemas/articles.schema';
import mongoose from 'mongoose';

@Controller('articles')
export class ArticlesController {
    constructor(private articleService : ArticlesService) {}

    @Post()
    async createArticle(
        @Body()
        article: CreateArticleDto
        ): Promise<any> {
        //use await after testing
        await this.articleService.handleArticlePost(article);
    }

    @Get('all')
    async getAllArticles(): Promise<Articles[]> {
        return this.articleService.getAllArticles();
    }

    @Post('incongruence')
    async incongruenceCheck(
        @Body()
        article: CreateArticleDto
        ): Promise<Articles> {
        //use await after testing
        return this.articleService.incongruenceCheck(article);
    }

}