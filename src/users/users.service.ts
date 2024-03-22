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
  constructor(
    @InjectModel('user') private readonly userModel: Model<User>,
    private mailService: MailService,
  ) {}

  //CRUD operations for user: Create
  
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


 //CRUD operations for user: Read
  async getUser(userName: string) {
    const username = userName.toLowerCase();
    const user = await this.userModel.findOne({ username });
    return user;
  }



  // CRUD operations for user: Update -change password

  async changeUserPassword(
    username: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // CRUD operations for user: Read -Curent password validation
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) {
      throw new BadRequestException('Old password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);



    // CRUD operations for user: Update  -Update password
    user.password = hashedPassword;
    await user.save();
  }

  
    // CRUD operations for user: Update  -Update username

  async changeUserName(username: string, newUsername: string) {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.username = newUsername;
    await user.save();
  }



// CRUD operations for user: Read  -find user by username

  async findUserByUsername(userName: string) {
    const username = userName.toLowerCase();
    const user = await this.userModel.findOne({ username });
    return user;
  }

// CRUD operations for user: Read -find user by email
  async findUserByUserEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    return user;
  }


  // CRUD operations for user: Read -find user designation by username
  async getDesignation(userName: string) {
    const username = userName.toLowerCase();
    const user = await this.userModel.findOne({ username });
    return user.designation;
  }



  // CRUD operations for user: Delete  - delete user
  async deleteUser(username: string) {
    const user = await this.userModel.findOneAndDelete({ username });
    return user;
  }

 /* async createUser(details:UserDetails)Promise<User>{
    const {email,displayName}=details;
    const user = await this.user
    
 }*/


}
