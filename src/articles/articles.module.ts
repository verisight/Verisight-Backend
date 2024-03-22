/**
 * The ArticlesModule is responsible for managing the articles and incongruence feature of the application.
 * It imports necessary modules, controllers, and services related to articles.
 * It also exports the ArticlesService for other modules to use.
 */
import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { ArticlesSchema } from './schemas/articles.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: 'Articles', schema: ArticlesSchema }]),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
