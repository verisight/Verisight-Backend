import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';
import { MailModule } from 'src/mail/mail.module';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './utils/GoogleStrategy';



@Module({
  imports: [UsersModule,PassportModule.register({ session: true }),MailModule],
  providers: [AuthService,LocalStrategy,SessionSerializer,GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
