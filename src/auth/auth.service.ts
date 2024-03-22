import { Injectable, NotAcceptableException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { UserDetails } from 'src/utils/types';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/schema/users.model';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService,@InjectModel('user') private readonly userModel: Model<User>) {}
  async validateUser(username: string, password: string): Promise<any> {
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

  validategoogleUser(details:UserDetails){
    //search databse for user with email
    //if user exists return user
    //if user does not exist create user
    console.log('AuthService')
    console.log(details);
    


  }
}
