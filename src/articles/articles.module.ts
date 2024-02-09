import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { ArticlesSchema } from './schemas/articles.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'Articles', schema: ArticlesSchema }])],
    controllers: [ArticlesController],
    providers: [ArticlesService],
})
export class ArticlesModule {}
