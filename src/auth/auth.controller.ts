import {Controller, Get} from "@nestjs/common";

@Controller('auth')
export class AuthController {



    //redirects user to googleoauth Screen
@Get('google/login')
    handleLogin(){

        return {msg: 'Google Authentication'}
    }


    //auth/googlle/redirect
//after sucessful or unsuccesful authentication google will redirect to our redirect url
    @Get('google/redirect')
    handleRedirect(){
        return {msg: 'OK'}
    }

    








}