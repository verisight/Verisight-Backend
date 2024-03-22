import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';
import { MailModule } from 'src/mail/mail.module';

import { GoogleStrategy } from './utils/GoogleStrategy';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/users/schema/users.model';



@Module({
  imports: [UsersModule,PassportModule.register({ session: true }),MailModule,MongooseModule.forFeature([{name:'user',schema:UserSchema}])],
  providers: [AuthService,LocalStrategy,SessionSerializer,GoogleStrategy,UsersModule,
  {
    provide:"AUTH_SERVICE", //this is the token
    useClass:AuthService,
  }],
  controllers: [],
})
export class AuthModule {}
