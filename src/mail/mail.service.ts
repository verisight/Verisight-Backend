import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';


@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(username:string,email:string) {
  

    await this.mailerService.sendMail({
      to: email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome to the Verisight Community !',
      template: './confirmation', // `.hbs` extension is appended automatically
      context: { 
        name: username,
       
      },
    });
  }
}
