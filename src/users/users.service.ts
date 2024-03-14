import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './users.model';
import * as bcrypt from 'bcrypt';
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

  async getUser(userName: string) {
    const username = userName.toLowerCase();
    const user = await this.userModel.findOne({ username });
    return user;
  }

  //change password 

  async changeUserPassword(username: string, oldPassword: string, newPassword: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) {
        throw new NotFoundException('User not found');
    }

    //Curent password validation
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) {
        throw new BadRequestException('Old password is incorrect');
    }

  
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update new  password
    user.password = hashedPassword;
    await user.save();
}
}
