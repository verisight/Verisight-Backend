import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
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
        return { error: error };
      }
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
  async checkEmail(@Body('email') email: string) {
    const user = await this.usersService.findUserByUserEmail(email);
    return { exists: Boolean(user) };
  }

  //check username
  @Post('check-username')
  async checkUsername(@Body('username') username: string) {
    const user = await this.usersService.findUserByUsername(username);
    return { exists: Boolean(user) };
  }

  //delete user
  @Post('delete-user')
  async deleteUser(@Body('username') username: string) {
    try {
      await this.usersService.deleteUser(username);
      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { error: 'User not found' };
      }
      return { error: 'Failed to delete user' };
    }
  }
}
