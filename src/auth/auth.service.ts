import { Injectable, NotAcceptableException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
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
    if (!user) {
      throw new NotAcceptableException('could not find the user');
    } else {
      const passwordValid = await bcrypt.compare(password, user.password);

      if (user && passwordValid) {
        return {
          userId: user.id,
          userName: user.username,
          email: user.email,
        };
      }
      return null;
    }
  }

 async  validateGoogleUser(details:UserDetails){
    //search databse for user with email
    //if user exists return user
    //if user does not exist create user

    console.log('AuthService')
    console.log(details);
    let user=await this.userModel.findOne({email:details.email});
    console.log(user);
    //if user is found return user
    if(user){
      return user;
  }
  console.log('User not found.Creating....');
  
  //if user is not found create user
  const username = await this.generateUniqueUsername(details.displayName);
  const newUser = new this.userModel({
    username: username,
    email: details.email,
  });

  await newUser.save();
  return newUser;
}


//making username unique
async generateUniqueUsername(displayName: string): Promise<string> {
  let username = displayName;
  let user = await this.userModel.findOne({ username });

  while (user) {

    const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    username = `${displayName}${randomNumber}`;
    user = await this.userModel.findOne({ username });
  }

  return username;
}
  
}
