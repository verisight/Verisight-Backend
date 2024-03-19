import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';
import { MailModule } from 'src/mail/mail.module';



@Module({
  imports: [UsersModule,PassportModule.register({ session: true }),MailModule],
  providers: [AuthService,LocalStrategy,SessionSerializer],
  controllers: [],
})
export class AuthModule {}
