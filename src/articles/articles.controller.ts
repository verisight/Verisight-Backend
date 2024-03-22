import { Controller, Post, Body, Get } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Articles } from './schemas/articles.schema';
import { link } from 'fs';
import { Throttle, SkipThrottle } from '@nestjs/throttler';

@Controller('articles')
export class ArticlesController {
  constructor(private articleService: ArticlesService) {}

  @Post()
  async createArticle(
    @Body()
    article: CreateArticleDto,
  ): Promise<any> {
    //use await after testing
    return this.articleService.handleArticlePost(article);
  }

  @Get('all')
  async getAllArticles(): Promise<Articles[]> {
    return this.articleService.getAllArticles();
  }

  @Post('incongruence')
  async incongruenceCheck(
    @Body()
    article: CreateArticleDto,
  ): Promise<Articles> {
    //use await after testing
    return this.articleService.incongruenceCheck(article);
  }

  @Post('getArticle')
  async getArticle(
    @Body()
    article: CreateArticleDto,
  ): Promise<Articles> {
    return this.articleService.findArticleByDto(article);
  }
}
