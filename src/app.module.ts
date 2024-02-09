import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticlesModule } from './articles/articles.module';
import { SummaryModule } from './summary/summary.module';

@Module({
  imports: [ArticlesModule, SummaryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
