import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://auth.verisightlabs.com',
      'http://localhost:5174',
    ],
    credentials: true,
  });
  app.set('trust proxy', 1);
  app.use(
    session({
      secret: 'verisight',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: 'auto',
        domain: 'verisightlabs.com',
        maxAge: 1000 * 60 * 60 * 24 * 365,
        sameSite: true,
        httpOnly: false,
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Application is running on port ${process.env.PORT}`);
}
bootstrap();
