import { Body, Controller, Post } from '@nestjs/common';
import { CrosscheckService } from './crosscheck.service';
import { CreateArticleDto } from '../articles/dto/create-article.dto';

@Controller('crosscheck')
export class CrosscheckController {
    constructor(private readonly crosscheckService: CrosscheckService) {}

    @Post()
    async CrossCheck(@Body() article: CreateArticleDto) {
        const result = await this.crosscheckService.getCrosscheck(article);
        return result;
    }

}
