import { Controller, Post } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { CreateArticleDto } from '../articles/dto/create-article.dto';

@Controller('summary')
export class SummaryController {

    constructor(private readonly summaryService: SummaryService) {}

    @Post()
    async createSummary(createArticleDto: CreateArticleDto) {
        return this.summaryService.createSummary(createArticleDto);
    }
}
