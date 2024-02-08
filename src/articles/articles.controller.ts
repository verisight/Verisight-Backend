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

import { Controller, Post, Body } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';

@Controller('articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) {}

    @Post()
    async createArticle(@Body() createArticleDto: CreateArticleDto) {
        //use await after testing
        return this.articlesService.handleArticlePost(createArticleDto);
    }

    @Post('all')
    async getAllArticles() {
        return this.articlesService.getAllArticles();
    }
}