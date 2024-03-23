import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import {  ConfigService } from '@nestjs/config';


//Global decorator  so that this module can be used without being imported
@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
    
      useFactory: async (config: ConfigService) => ({
        // transport: config.get("MAIL_TRANSPORT"),
        // or
                // Setting up the transport configuration for the mailer
        transport: {
          host: config.get('MAIL_HOST'),
          secure: false, // If true the connection will use TLS when connecting to server
          auth: {
            user: config.get('MAIL_USER'),
            pass: config.get('MAIL_PASSWORD'),
            
          },
        },
        defaults: {
          from: `"No Reply" <${config.get('MAIL_FROM')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),  // Directory for mail templates
          adapter: new HandlebarsAdapter(), // Adapter to use for templates
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

