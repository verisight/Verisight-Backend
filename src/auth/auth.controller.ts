import {Controller, Get, UseGuards} from "@nestjs/common";
import { GoogleAuthGuard } from "./utils/Guards";

@Controller('auth')
export class AuthController {



    //redirects user to googleoauth Screen

@Get('google/login')
@UseGuards(GoogleAuthGuard)
    handleLogin(){

        return {msg: 'Google Authentication'}
    }


    //auth/googlle/redirect
//after sucessful or unsuccesful authentication google will redirect to our redirect url
    @Get('google/redirect')
    @UseGuards(GoogleAuthGuard)
    handleRedirect(){
        return {msg: 'OK'}
    }

    








}