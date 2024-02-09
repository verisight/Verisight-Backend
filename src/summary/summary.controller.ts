import { Body, Controller, Post } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { CreateArticleDto } from '../articles/dto/create-article.dto';

@Controller('summary')
export class SummaryController {

    constructor(private readonly summaryService: SummaryService) {}

    @Post()
    async createSummary(@Body() createArticleDto: CreateArticleDto) {
        if (!createArticleDto.link || !createArticleDto.title || !createArticleDto.content || !createArticleDto.datePublished) {
            throw new Error('Invalid article data');
        }
        return this.summaryService.createSummary(createArticleDto);
    }
}
