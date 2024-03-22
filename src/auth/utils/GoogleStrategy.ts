import { Injectable } from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import { Profile, Strategy } from "passport-google-oauth20";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy){

constructor (){
    super({
        clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
        clientSecret:process.env.GOOGLE_AUTH_CLIENT_SECRET,
        callbackURL:process.env.CALLBACK_URL,
        scope: ['profile','email'],
    });
}

//method after user is successfuly authenticated themself with google
async validate(accessToken:string,refreshToken:string,profile:Profile){

console.log(accessToken);
console.log(refreshToken);
console.log(profile);




}
}

