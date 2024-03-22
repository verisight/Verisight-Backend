import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ArticlesModule } from './articles/articles.module';
import { SummaryModule } from './summary/summary.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CrosscheckModule } from './crosscheck/crosscheck.module';
import { NotesModule } from './notes/notes.module';
import { UsersModule } from './users/users.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { MailModule } from './mail/mail.module';
import { GoogleStrategy } from './auth/utils/GoogleStrategy';

@Module({
  imports: [
    AuthModule,
    ArticlesModule,
    SummaryModule,
    ConfigModule.forRoot({
      envFilePath: './.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    CrosscheckModule,
    NotesModule,
    UsersModule, //added a comma
    ThrottlerModule.forRoot([
      {
        name: 'short-term',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'long-term',
        ttl: 60000,
        limit: 100,
      },
    ]), MailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
      
    },
    GoogleStrategy,
  ],
})
export class AppModule {}
