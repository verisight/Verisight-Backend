import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport"; //function that is  imported from the nest js passport module
import { Profile, Strategy } from "passport-google-oauth20"; 
import { AuthService } from "../auth.service";

@Injectable()

//Passport strategy returns a class and we are extending that class
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService : AuthService,
  ) {
    super({
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      callbackURL: process.env.CALL_BACK_URL,
     // passReqToCallback: true,
      scope: ['email', 'profile'],
    });
  }

  async validate (accessToken:string,refreshToken:string,profile:Profile){
    console.log(accessToken);
    console.log(refreshToken);
    console.log(profile);
    const user =await this.authService.validateGoogleUser({
        email:profile.emails[0].value,
        displayName:profile.displayName,
    });
    console.log('Validate');
    console.log(user);

    return user||null;//null if user not found(user not authenticated)

  }
}