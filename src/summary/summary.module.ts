import { Module } from '@nestjs/common';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';
import { ArticlesModule } from 'src/articles/articles.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ArticlesModule, ConfigModule],
  controllers: [SummaryController],
  providers: [SummaryService],
})
export class SummaryModule {}
