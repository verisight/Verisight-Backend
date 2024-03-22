import { Controller, Post, Body, Get } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Articles } from './schemas/articles.schema';

@Controller('articles')
/**
 * Controller class for handling article-related operations.
 */
export class ArticlesController {
  constructor(private articleService: ArticlesService) {}

  /**
   * Creates a new article.
   * @param article - The article data to be created.
   * @returns A promise that resolves to the created article.
   */
  @Post()
  async createArticle(
    @Body()
    article: CreateArticleDto,
  ): Promise<any> {
    //use await after testing
    return this.articleService.handleArticlePost(article);
  }

  /**
   * Retrieves all articles.
   * @returns A promise that resolves to an array of articles.
   */
  @Get('all')
  async getAllArticles(): Promise<Articles[]> {
    return this.articleService.getAllArticles();
  }

  /**
   * Performs an incongruence check on the given article.
   * @param article - The article data to be checked.
   * @returns A promise that resolves to the checked article.
   */
  @Post('incongruence')
  async incongruenceCheck(
    @Body()
    article: CreateArticleDto,
  ): Promise<Articles> {
    //use await after testing
    return this.articleService.incongruenceCheck(article);
  }

  /**
   * Retrieves an article based on the given article data.
   * @param article - The article data to search for.
   * @returns A promise that resolves to the found article.
   */
  @Post('getArticle')
  async getArticle(
    @Body()
    article: CreateArticleDto,
  ): Promise<Articles> {
    return this.articleService.findArticleByDto(article);
  }
}
