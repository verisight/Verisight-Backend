import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';
import { GoogleStrategy } from './google.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [UsersModule,PassportModule.register({ session: true })],
  providers: [AuthService,LocalStrategy,SessionSerializer],
  controllers: [AuthController],
})
export class AuthModule {}
