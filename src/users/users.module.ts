import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UserSchema } from './schema/users.model';
import { UsersService } from './users.service';
import { MailModule } from "src/mail/mail.module"
@Module({
  imports: [MongooseModule.forFeature([{ name: 'user', schema: UserSchema }]),MailModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
