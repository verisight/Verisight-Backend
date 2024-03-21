import { Injectable, NotAcceptableException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { UserDetails } from './utils/types';
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

/*google validation
1.check if user exists 
2.if not creates acc
*/

  async validateGoogleUser(details:UserDetails){


  try{console.log('AuthService');
  console.log(details);
  //search database for user 
  const user =await this.userModel.findOne({email:details.email});
  console.log(user)
  if(user)return user;
  console.log('user not found.Creating.... ')

  if (await this.usersService.isUserNameUnique(details.displayName))  {
    const randomNumber = Math.floor(Math.random() * 10000);  
    details.displayName = `${details.displayName}-${randomNumber}`;
  }
  const newUser= new this.userModel({
  username:details.displayName,
  email:details.email,

  });
  return await newUser.save();

}catch(error){
  console.log(error);
 



}

}
}
