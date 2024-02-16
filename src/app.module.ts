import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserAuthModule } from './user_auth/user_auth.module';
import { ArticlesModule } from './articles/articles.module';
import { SummaryModule } from './summary/summary.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    UserAuthModule,
    ArticlesModule, 
    SummaryModule,
    MongooseModule.forRoot("mongodb+srv://pragash:PPT01102005@cluster0.9dpn1el.mongodb.net/?retryWrites=true&w=majority"),
    ConfigModule.forRoot({
      envFilePath: './.env',
      isGlobal: true,
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
