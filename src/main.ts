import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from "express-session"
import * as passport from "passport";


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({origin: 'http://localhost:5173',credentials: true});
  app.use(
    session({
      secret:"verisight",
      resave:false,
      saveUninitialized:false,
      cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 * 365}
  })

  

  )
  app.use(passport.initialize())
  app.use(passport.session())
  
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
