import { Controller, Get, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from './utils/Guards';

@Controller('auth')//end point resource  . everything in this controller will be /auth
export class AuthController {


// redirect users to google login
//passport is the middleware to handle the redirection

@UseGuards(GoogleAuthGuard)
@Get('google/login')
    handleLogin(){
return {
    msg:'Google authentication'};
    
}
    
//failed to authneticate user


@UseGuards(GoogleAuthGuard)
@Get('google/redirect')
    handleRedirect(){
        return {
            msg:'OK'};
    }

}
