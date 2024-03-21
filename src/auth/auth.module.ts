import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';
import { MailModule } from 'src/mail/mail.module';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './utils/GoogleStrategy';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/users/schema/users.model';



@Module({
  imports: [UsersModule,PassportModule.register({ session: true }),MailModule,MongooseModule.forFeature([{ name: 'user', schema: UserSchema }])],
  providers: [AuthService,LocalStrategy,SessionSerializer,GoogleStrategy,
  {
provide:'AUTH_SERVICE',
useClass:AuthService,
  }],
  controllers: [AuthController],
})
export class AuthModule {}
