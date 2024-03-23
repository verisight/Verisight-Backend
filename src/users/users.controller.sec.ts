import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, connect } from 'mongoose';
import { User, UserSchema } from './schema/users.model';
import { MailService } from '../mail/mail.service';
import { MailerModule } from '@nestjs-modules/mailer';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let AuthService: AuthService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<User>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model<User>('User', UserSchema);

    const module: TestingModule = await Test.createTestingModule({
      imports: [MailerModule],
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: userModel },
        MailService,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('addUser', () => {
    it('should add a new user', async () => {
      // Arrange
      const userName = 'testuser';
      const userPassword = 'testpassword';
      const email = 'test@example.com';
      const designation = 'Test Designation';
      const profilePicture = 'test.jpg';

      const hashRounds = 10;
      const hashedPassword = 'hashedpassword';
      const result = {
        id: 1,
        username: userName,
        email,
        designation,
        profilePicture,
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

      // Act
      const response = await controller.addUser(
        userName,
        userPassword,
        email,
        designation,
        profilePicture,
      );

      // Assert
      expect(service.findUserByUsername).toHaveBeenCalledWith(userName);
      expect(service.findUserByUserEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.hash).toHaveBeenCalledWith(userPassword, hashRounds);
      expect(Response).toEqual({
        msg: 'User successfully registered',
        userId: result.id,
        userName: result.username,
        email: result.email,
        designation: result.designation,
        profilePicture: result.profilePicture,
      });
    });

    it('should throw BadRequestException if username already exists', async () => {
      // Arrange
      const userName = 'testuser';
      const userPassword = 'testpassword';
      const email = 'test@example.com';
      const designation = 'Test Designation';
      const profilePicture = 'test.jpg';

      const existingUser = {
        username: userName,
        email: email,
        designation,
        profilePicture,
      };
      const existingEmail = existingUser.email;

      jest
        .spyOn(service, 'findUserByUsername')
        .mockResolvedValue(existingUser as any);
      jest
        .spyOn(service, 'findUserByUserEmail')
        .mockResolvedValue(existingEmail as any);

      // Act & Assert
      await expect(
        controller.addUser(
          userName,
          userPassword,
          email,
          designation,
          profilePicture,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if email already exists', async () => {
      // Arrange
      const userName = 'testuser';
      const userPassword = 'testpassword';
      const email = 'test@example.com';
      const designation = 'Test Designation';
      const profilePicture = 'test.jpg';

      const existingUser = {
        username: userName,
        email: email,
        designation,
        profilePicture,
      };
      const existingEmail = { email };

      jest
        .spyOn(service, 'findUserByUsername')
        .mockResolvedValue(existingUser as any);
      jest
        .spyOn(service, 'findUserByUserEmail')
        .mockResolvedValue(existingEmail as any);

      // Act & Assert
      await expect(
        controller.addUser(
          userName,
          userPassword,
          email,
          designation,
          profilePicture,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if an error occurs', async () => {
      // Arrange
      const userName = 'testuser';
      const userPassword = 'testpassword';
      const email = 'test@example.com';
      const designation = 'Test Designation';
      const profilePicture = 'test.jpg';

      const existingUser = null;
      const existingEmail = null;

      jest
        .spyOn(service, 'findUserByUsername')
        .mockResolvedValue(existingUser as any);
      jest
        .spyOn(service, 'findUserByUserEmail')
        .mockResolvedValue(existingEmail);

      // Act & Assert
      await expect(
        controller.addUser(
          userName,
          userPassword,
          email,
          designation,
          profilePicture,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should return the logged in user', async () => {
      // Arrange
      const req = { user: { username: 'testuser' } };

      // Act
      const response = await controller.login(req);

      // Assert
      expect(response).toEqual({ user: req.user, message: 'User logged in' });
    });

    it('should return an error message if login fails', async () => {
      // Arrange
      const req = {};

      jest.spyOn(AuthService, 'validateUser').mockRejectedValue(new Error());

      // Act
      const response = await controller.login(req);

      // Assert
      expect(response).toEqual({ error: 'User Login Failed' });
    });
  });

  describe('getHello', () => {
    it('should return the user with designation if user exists', async () => {
      // Arrange
      const req = { user: { userName: 'testuser' } };
      const designation = 'Test Designation';

      jest.spyOn(service, 'getDesignation').mockResolvedValue(designation);

      // Act
      const response = await controller.getHello(req);

      // Assert
      expect(service.getDesignation).toHaveBeenCalledWith(req.user.userName);
      expect(response).toEqual({ ...req.user, designation });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // Arrange
      const req = { user: null };

      jest.spyOn(service, 'getDesignation').mockResolvedValue(null);

      // Act & Assert
      await expect(controller.getHello(req)).rejects.toThrow(NotFoundException);
    });

    it('should return an error message if an error occurs', async () => {
      // Arrange
      const req = { user: { userName: 'testuser' } };

      jest.spyOn(service, 'getDesignation').mockRejectedValue(new Error());

      // Act & Assert
      await expect(controller.getHello(req)).rejects.toThrow(Error);
    });
  });

  describe('logout', () => {
    it('should destroy the user session', () => {
      // Arrange
      const req = { session: { destroy: jest.fn() } };

      // Act
      const response = controller.logout(req);

      // Assert
      expect(req.session.destroy).toHaveBeenCalled();
      expect(response).toEqual({ msg: 'The user session has ended' });
    });
  });

  describe('changePassword', () => {
    it('should change the user password', async () => {
      // Arrange
      const username = 'testuser';
      const oldPassword = 'oldpassword';
      const newPassword = 'newpassword';

      // Act
      const response = await controller.changePassword(
        username,
        oldPassword,
        newPassword,
      );

      // Assert
      expect(service.changeUserPassword).toHaveBeenCalledWith(
        username,
        oldPassword,
        newPassword,
      );
      expect(response).toEqual({ message: 'Password changed successfully' });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // Arrange
      const username = 'testuser';
      const oldPassword = 'oldpassword';
      const newPassword = 'newpassword';

      jest
        .spyOn(service, 'changeUserPassword')
        .mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(
        controller.changePassword(username, oldPassword, newPassword),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return an error message if an error occurs', async () => {
      // Arrange
      const username = 'testuser';
      const oldPassword = 'oldpassword';
      const newPassword = 'newpassword';

      jest.spyOn(service, 'changeUserPassword').mockRejectedValue(new Error());

      // Act & Assert
      await expect(
        controller.changePassword(username, oldPassword, newPassword),
      ).rejects.toThrow(Error);
    });
  });

  describe('changeUsername', () => {
    it('should change the username', async () => {
      // Arrange
      const oldUsername = 'olduser';
      const newUsername = 'newuser';

      // Act
      const response = await controller.changeUsername(
        oldUsername,
        newUsername,
      );

      // Assert
      expect(service.changeUserName).toHaveBeenCalledWith(
        oldUsername,
        newUsername,
      );
      expect(response).toEqual({ message: 'Username changed successfully' });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // Arrange
      const oldUsername = 'olduser';
      const newUsername = 'newuser';

      jest
        .spyOn(service, 'changeUserName')
        .mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(
        controller.changeUsername(oldUsername, newUsername),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return an error message if an error occurs', async () => {
      // Arrange
      const oldUsername = 'olduser';
      const newUsername = 'newuser';

      jest.spyOn(service, 'changeUserName').mockRejectedValue(new Error());

      // Act & Assert
      await expect(
        controller.changeUsername(oldUsername, newUsername),
      ).rejects.toThrow(Error);
    });
  });

  describe('checkEmail', () => {
    it('should return whether the email exists or not', async () => {
      // Arrange
      const email = 'test@example.com';
      const user = { email };

      jest.spyOn(service, 'findUserByUserEmail').mockResolvedValue(user as any);

      // Act
      const response = await controller.checkEmail(email);

      // Assert
      expect(service.findUserByUserEmail).toHaveBeenCalledWith(email);
      expect(response).toEqual({ exists: true });
    });

    it('should return whether the email exists or not', async () => {
      // Arrange
      const email = 'test@example.com';

      jest.spyOn(service, 'findUserByUserEmail').mockResolvedValue(null);

      // Act
      const response = await controller.checkEmail(email);

      // Assert
      expect(service.findUserByUserEmail).toHaveBeenCalledWith(email);
      expect(response).toEqual({ exists: false });
    });
  });

  describe('checkUsername', () => {
    it('should return whether the username exists or not', async () => {
      // Arrange
      const username = 'testuser';
      const user = { username };

      jest.spyOn(service, 'findUserByUsername').mockResolvedValue(user as any);

      // Act
      const response = await controller.checkUsername(username);

      // Assert
      expect(service.findUserByUsername).toHaveBeenCalledWith(username);
      expect(response).toEqual({ exists: true });
    });

    it('should return whether the username exists or not', async () => {
      // Arrange
      const username = 'testuser';

      jest.spyOn(service, 'findUserByUsername').mockResolvedValue(null);

      // Act
      const response = await controller.checkUsername(username);

      // Assert
      expect(service.findUserByUsername).toHaveBeenCalledWith(username);
      expect(response).toEqual({ exists: false });
    });
  });

  describe('deleteUser', () => {
    it('should delete the user', async () => {
      // Arrange
      const username = 'testuser';

      // Act
      const response = await controller.deleteUser(username);

      // Assert
      expect(service.deleteUser).toHaveBeenCalledWith(username);
      expect(response).toEqual({ message: 'User deleted successfully' });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // Arrange
      const username = 'testuser';

      jest
        .spyOn(service, 'deleteUser')
        .mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(controller.deleteUser(username)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return an error message if an error occurs', async () => {
      // Arrange
      const username = 'testuser';

      jest.spyOn(service, 'deleteUser').mockRejectedValue(new Error());

      // Act & Assert
      await expect(controller.deleteUser(username)).rejects.toThrow(Error);
    });
  });
});
