import { Module } from '@nestjs/common';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';
import { ArticlesModule } from 'src/articles/articles.module';

@Module({
  imports: [ArticlesModule],
  controllers: [SummaryController],
  providers: [SummaryService]
})
export class SummaryModule {}
