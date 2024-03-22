import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { NotAcceptableException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, connect } from 'mongoose';
import { User, UserSchema } from '../users/schema/users.model';
import { MailService } from '../mail/mail.service';
import { MailModule } from '../mail/mail.module';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<User>;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      // Implement mock values for ConfigService here
      if (key === 'MAILER_OPTIONS') {
        return {
          transport: {
            host: 'smtp.example.com',
            port: 587,
            secure: false,
            auth: {
              user: 'MAIL_USER',
              pass: 'MAIL_PASSWORD',
            },
          },
        };
      }
      return null;
    }),
  };

  const mockMailService = {
    sendVerificationEmail: jest.fn(),
  };

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model<User>('User', UserSchema); // Update the type of userModel
    const module: TestingModule = await Test.createTestingModule({
      imports: [MailerModule],
      providers: [
        { provide: getModelToken('user'), useValue: userModel },
        AuthService,
        UsersService,
        { provide: MailService, useValue: mockMailService },
        { provide: ConfigService, useValue: mockConfigService }, // Mock ConfigService
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);

    //Make a fake user
    const user = new userModel({
      username: 'testuser',
      email: 'test1234@gmail.com',
      password: 'testpassword',
    });
    await user.save();
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data if username and password are valid', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'testpassword';
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('testpassword', 10),
      };
      jest.spyOn(usersService, 'getUser').mockResolvedValue(user as any);

      // Act
      const result = await service.validateUser(username, password);

      // Assert
      expect(result).toEqual({
        userId: user.id,
        userName: user.username,
        email: user.email,
      });
    });

    it('should throw NotAcceptableException if user is not found', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'testpassword123';
      jest.spyOn(usersService, 'getUser').mockResolvedValue(null);

      // Act & Assert
      await expect(service.validateUser(username, password)).rejects.toThrow(
        NotAcceptableException,
      );
    });

    it('should return null if password is invalid', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'testpassword';
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('otherpassword', 10),
      };
      jest.spyOn(usersService, 'getUser').mockResolvedValue(user as any);

      // Act
      const result = await service.validateUser(username, password);

      // Assert
      expect(result).toBeNull();
    });
  });
});
