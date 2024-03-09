import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import { LocalAuthGuard } from 'src/auth/local.auth.guard';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard.ts';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  //sign up 

  @Post('/signup')
  async addUser(
    
    @Body('username') userName: string,
    @Body('password') userPassword: string,
    @Body('email') email: string,
    @Body('designation') designation: string,
    @Body('profilePicture') profilePicture: string,
  ) {


    const hashRounds = 10;
    const hashedPassword = await bcrypt.hash(userPassword, hashRounds);
    const result = await this.usersService.insertUser(
      userName,
       hashedPassword,
        email,
        designation,
        profilePicture
    );
    return {
      msg: 'User successfully registered',
      userId: result.id,
      userName: result.username,
      email: result.email,
        designation: result.designation,
        profilePicture: result.profilePicture
    };
  }


  //Login
  @UseGuards(LocalAuthGuard)
  @Post('/login')
      login(@Request() req): any {
        return {User: req.user,
                msg: 'User logged in'};
      }

        //Protected route
      @UseGuards(AuthenticatedGuard)
      @Get('/protected')
      getHello(@Request() req): string {
        return req.user;
        
      }
    

      // logout
      @Get('/logout')
        logout(@Request() req): any {
          req.session.destroy();
          return { msg: 'The user session has ended' }
        }

}