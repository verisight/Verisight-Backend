import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // Create the Nest application instance and set up the express application
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Enabling CORS for the application to allow requests from the client
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://auth.verisightlabs.com',
      'http://localhost:5174',
      'chrome-extension://hejkeenlnjhgdkkocgkfehedbcbioddh',
    ],
    credentials: true,
  });
  app.set('trust proxy', 1);
  // Enable sessions for the application to store user data in the session
  app.use(
    session({
      secret: 'verisight',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        domain: 'verisightlabs.com',
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: false,
      },
    }),
  );
  // Enable passport middleware for authentication
  app.use(passport.initialize());
  app.use(passport.session());

  // Start the application on the specified port
  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Application is running on port ${process.env.PORT}`);
}
bootstrap();
