import { Inject, Injectable } from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import { Profile, Strategy } from "passport-google-oauth20";
import { AuthService } from "../auth.service";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy){

constructor (
    @Inject("AUTH_SERVICE") private readonly authService:AuthService,
){
    super({
        clientID:process.env.GOOGLE_AUTH_CLIENT_ID,
        clientSecret:process.env.GOOGLE_AUTH_CLIENT_SECRET,
        callbackURL:process.env.CALL_BACK_URL, 
        scope: ['profile','email']




       /* clientID:,
        clientSecret:process.env.GOOGLE_AUTH_CLIENT_SECRET,
        callbackURL:process.env.CALL_BACK_URL, 
        scope: ['profile','email'],*/

    });
}

//authenticates user with google
//method after user is successfuly authenticated themself with google
async validate(accessToken:string,refreshToken:string,profile:Profile){

console.log(accessToken);
console.log(refreshToken);
console.log(profile);

const user = await this.authService.validateGoogleUser({
    email: profile.emails[0].value,
    displayName: profile.displayName,
  });

}
}

