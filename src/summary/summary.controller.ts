import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { CreateArticleDto } from '../articles/dto/create-article.dto';
import { ArticlesService } from '../articles/articles.service';

@Controller('summary')
export class SummaryController {

    constructor(private readonly summaryService: SummaryService, private readonly articleService: ArticlesService) {}

    @Post()
    async createSummary(@Body() createArticleDto: CreateArticleDto) {
        if (!createArticleDto.link) {
            throw new Error('Invalid article data');
        }
        const ArticleDto = await this.articleService.findArticleByDto(createArticleDto);
        const summary = await this.summaryService.createSummary(ArticleDto);
        return summary;
    }

    //GET Request which cotains the link in the route.
    @Get(':id')
    async findArticle(@Param('id') id : string){
        console.log(`Finding article with link: ${id}`)
        const response = await this.articleService.findArticleByLink(id);
        const summary = this.summaryService.createSummary(response);
        return summary;
    }
}
