import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/users.model';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
@Injectable()
export class UsersService {
  constructor(@InjectModel('user') private readonly userModel: Model<User>,private mailService: MailService) {}
  async insertUser(
    userName: string,
    password: string,
    email: string,
    designation: string,
    profilePicture: string,
  ) {
    const username = userName.toLowerCase();
    const newUser = new this.userModel({
      username,
      password,
      email,
      designation,
      profilePicture,
    });
    await newUser.save();

    //send welcome mail when user signs up
    await this.mailService.sendUserConfirmation(username, email);
    return newUser;
  }

  async getUser(userName: string) {
    const username = userName.toLowerCase();
    const user = await this.userModel.findOne({ username });
    return user;
  }

  //change password

  async changeUserPassword(
    username: string,
    oldPassword: string,
    newPassword: string,
  ) {
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

  //find user by username 

  async findUserByUsername(userName: string) {
    const username = userName.toLowerCase();
    const user = await this.userModel.findOne({ username });
    return user;
  }
//find user by email
  async findUserByUserEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    return user;
  }

}
