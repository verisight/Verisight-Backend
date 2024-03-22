import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';

describe('MailService', () => {
  let service: MailService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendUserConfirmation', () => {
    it('should send user confirmation email', async () => {
      const username = 'testuser';
      const email = 'test@example.com';

      await service.sendUserConfirmation(username, email);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: email,
        subject: 'Welcome to the Verisight Community! ' + username,
        template: './confirmation',
        context: {
          user_name: username,
        },
      });
    });
  });
});
