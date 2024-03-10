import { Injectable, NotAcceptableException } from '@nestjs/common';
    import { UsersService } from 'src/users/users.service';
    import * as bcrypt from 'bcrypt';
    import axios from 'axios';

    @Injectable()
    export class AuthService {
      constructor(private readonly usersService: UsersService) {}
      async validateUser(username:string, password: string): Promise<any> {


        const user = await this.usersService.getUser(username);
        const passwordValid = await bcrypt.compare(password, user.password);
        if (!user) {
            throw new NotAcceptableException('could not find the user');
          }

       
        if (user && passwordValid) {
          return {
            userId: user.id,
            userName: user.username,
            email: user.email,
          };
        }
        return null;
      }


      /*
      1.Handle gogole token management , access ,expiration and revocation 
      */
      async getNewAccessToken(refreshToken: string): Promise<string> {
        try {
          const response = await axios.post(
            'https://accounts.google.com/o/oauth2/token',
            {
              client_id: process.env.GOOGLE_CLIENT_ID,
              client_secret: process.env.GOOGLE_CLIENT_SECRET,
              refresh_token: refreshToken,
              grant_type: 'refresh_token',
            },
          );
    
          return response.data.access_token;
        } catch (error) {
          throw new Error('Failed to refresh the access token.');
        }
      }
    
      async getProfile(token: string) {
        try {
          return axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`,
          );
        } catch (error) {
          console.error('Failed to revoke the token:', error);
        }
      }
    
      async isTokenExpired(token: string): Promise<boolean> {
        try {
          const response = await axios.get(
            `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`,
          );
    
          const expiresIn = response.data.expires_in;
    
          if (!expiresIn || expiresIn <= 0) {
            return true;
          }
        } catch (error) {
          return true;
        }
      }

      async revokeGoogleToken(token: string) {
        try {
          await axios.get(
            `https://accounts.google.com/o/oauth2/revoke?token=${token}`,
          );
        } catch (error) {
          console.error('Failed to revoke the token:', error);
        }
      }
    }



    