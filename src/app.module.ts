import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ArticlesModule } from './articles/articles.module';
import { SummaryModule } from './summary/summary.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CrosscheckModule } from './crosscheck/crosscheck.module';
import { NotesModule } from './notes/notes.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
  
    ArticlesModule, 
    SummaryModule,
    MongooseModule.forRoot("mongodb+srv://pragash:PPT01102005@cluster0.9dpn1el.mongodb.net/?retryWrites=true&w=majority"),
    ConfigModule.forRoot({
      envFilePath: './.env',
      isGlobal: true,
    }),
    CrosscheckModule,
    NotesModule,
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
