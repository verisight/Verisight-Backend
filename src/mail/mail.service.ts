import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';


@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(username:string, email: string) { // Function to send email to user
   

    await this.mailerService.sendMail({
      to: email,
    
      subject: 'Welcome to the Verisight Community! ' + username,
      template: './confirmation', 
      context: { // Data to be sent to template engine.
        user_name: username,
    
      },
    });
  }
}



