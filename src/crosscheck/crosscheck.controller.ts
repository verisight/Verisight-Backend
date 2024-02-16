import { Body, Controller, Post } from '@nestjs/common';
import { CrosscheckService } from './crosscheck.service';

@Controller('crosscheck')
export class CrosscheckController {
    constructor(private readonly crosscheckService: CrosscheckService) {}

    @Post()
    async CrossCheck(@Body() article: {headline: string, body: string}) {
        const result = await this.crosscheckService.getCrosscheck(article);
        return result;
    }

}
