import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import { LocalAuthGuard } from 'src/auth/local.auth.guard';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard.ts';
import { Response } from 'express';
import { Store } from 'express-session';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  //sign up

  @Post('/signup')
  async addUser(
    @Body('username') userName: string,
    @Body('password') userPassword: string,
    @Body('email') email: string,
    @Body('designation') designation: string,
    @Body('profilePicture') profilePicture: string,
  ) {
    try {
      //check if user name already exists

      const existingUser = await this.usersService.findUserByUsername(userName);
      if (existingUser) {
        throw new BadRequestException('Username already in use');
      }
      //check if email already exists
      const existingEmail = await this.usersService.findUserByUserEmail(email);
      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }

      const hashRounds = 10;
      const hashedPassword = await bcrypt.hash(userPassword, hashRounds);
      const result = await this.usersService.insertUser(
        userName,
        hashedPassword,
        email,
        designation,
        profilePicture,
      );
      return {
        msg: 'User successfully registered',
        userId: result.id,
        userName: result.username,
        email: result.email,
        designation: result.designation,
        profilePicture: result.profilePicture,
      };
    } catch (error) {
      // Handle errors
      console.log(error);
      throw new BadRequestException('Failed to register user');
    }
  }

  //login
  //using local auth guard to authenticate userbased on username and password

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Request() req): Promise<any> {//authentication succesful user obj attatched to req
    try {
      return { user: req.user, message: 'User logged in' };
    } catch (error) { //catches unauthorized exception thrown  by local authguard if user is not authenticated
      return { error: 'User Login Failed' };
    }
  }

  //Protected route
  //Authenticated guard ensures asll routes are authenticated

  @UseGuards(AuthenticatedGuard)
  @Get('/protected')
  async getHello(@Request() req): Promise<any> {
    try {
      const user = req.user;
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const designation = await this.usersService.getDesignation(user.userName);
      user.designation = designation;
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { error: error.message };
      } else {
        return { error: 'Failed to get user'};
      }
    }
  }

  // Route that takes connect.sid as a parameter
  @Post('auth/cookie')
  async loginWithCookie(@Request() req, @Body () {session} : {session: string}) {
    const response = await fetch('http://localhost:3000/users/protected', {
      method: 'GET',
      headers: {
        Cookie: `connect.sid=${session}`
      }
    })

    if (!response.ok) {
      throw new ForbiddenException();
    } else {
      return response.json();
    }
  }

  // logout route that takes connect.sid as a parameter
  @Post('auth/cookielogout')
  async logoutWithCookie(@Request() req, @Body () {session} : {session: string}) {
    const response = await fetch('http://localhost:3000/users/logout', {
      method: 'GET',
      headers: {
        Cookie: `connect.sid=${session}`
      }
    })

    if (!response.ok) {
      throw new ForbiddenException();
    } else {
      return response.json();
    }

  }

  // logout
  @Get('/logout')
  logout(@Request() req): any {
    req.session.destroy();
    return { msg: 'The user session has ended' };
  }

  //change user password
  @Post('/change-user-password')
  async changePassword(
    @Body('username') username: string,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    try {
      await this.usersService.changeUserPassword(
        username,
        oldPassword,
        newPassword,
      );
      return { message: 'Password changed successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { error: 'User not found' };
      }
      return { error: 'Failed to change password' };
    }
  }

  //Change username
  @Post('/change-username')
  async changeUsername(
    @Body('oldUsername') oldUsername: string,
    @Body('newUsername') newUsername: string,
  ) {
    try {
      await this.usersService.changeUserName(oldUsername, newUsername);
      return { message: 'Username changed successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { error: 'User not found' };
      }
      return { error: 'Failed to change username' };
    }
  }

  //check email
  @Post('check-email')
  async checkEmail(@Body('email') email: string,@Res() res: Response) {
    const user = await this.usersService.findUserByUserEmail(email);
    return res.status(200).json({ exists: Boolean(user) });
  }

  //check username
  @Post('check-username')
  async checkUsername(@Body('username') username: string,@Res() res: Response) {
    const user = await this.usersService.findUserByUsername(username);
    return res.status(200).json({ exists: Boolean(user) });
  }


  //delete user
  @Post('delete-user')
  async deleteUser(@Body('username') username: string,@Res() res: Response) {
    try {
      await this.usersService.deleteUser(username);
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  }
}
