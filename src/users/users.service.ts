import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './users.model';
@Injectable()

export class UsersService {
  constructor(@InjectModel('user') private readonly userModel: Model<User>) {}
  async insertUser(userName: string, password: string,email:string,designation:string,profilePicture:string) {
    const username = userName.toLowerCase();
    const newUser = new this.userModel({
      username,
      password,
        email,
        designation,
        profilePicture
    });
    await newUser.save();
    return newUser;
  }

  async getUser(email: string) {
   
    const user = await this.userModel.findOne({ email });
    return user;
  }
}
