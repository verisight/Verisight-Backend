import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserAuthController } from "./user_auth.controller";
import { UserAuthService } from "./user_auth.service";

@Module({
    controllers: [UserAuthController],
    providers: [UserAuthService],
})

export class UserAuthModule {}