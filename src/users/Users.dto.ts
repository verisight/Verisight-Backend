import { IsEmail, IsNotEmpty ,IsString,MinLength
} from 'class-validator';

export class UserDto {

    @IsNotEmpty()
    @IsString()
    username: string;


    @IsNotEmpty()
    @IsEmail()
    email: string;



    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @IsString()
    designation: string;
  }

  