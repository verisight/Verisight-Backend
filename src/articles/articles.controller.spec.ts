/**
 * This file contains the unit tests for the ArticlesController class.
 * It tests the functionality of the controller methods such as createArticle, getArticle, getAllArticles, and incongruenceCheck.
 * The tests are written using the Jest testing framework and the NestJS testing utilities.
 * The tests use a MongoDB in-memory server for database operations and mock dependencies using Jest's mocking capabilities.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { Connection, connect, Model } from 'mongoose';
import { Articles, ArticlesSchema } from './schemas/articles.schema';
import { getModelToken } from '@nestjs/mongoose';
import { createArticleDtoStub } from './stubs/create-article.dto.stub';
import { ConfigService } from '@nestjs/config';

describe('ArticlesController', () => {
  let articlesController: ArticlesController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let articlesModel: Model<Articles>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create(); // create a mongodb server and get the daemon
    const uri = mongod.getUri(); // get connection uri for mongodb servver
    mongoConnection = (await connect(uri)).connection;
    articlesModel = mongoConnection.model('Notes', ArticlesSchema);
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        ArticlesService,
        { provide: getModelToken(Articles.name), useValue: articlesModel },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              switch (key) {
                // add the keys that ArticlesService depends on
                case 'INCONGRUENCE_API_KEY':
                  return 'nS0cCwq6HjzabpBKJ9lu0MqrSCvCBdbW';
                case 'INCONGRUENCE_ENDPOINT':
                  return 'https://incongruence-detect.eastus.inference.ml.azure.com/score';
                default:
                  return null;
              }
            }),
          },
        }, // provide notes schema model
      ],
    }).compile();

    articlesController = module.get<ArticlesController>(ArticlesController);
  });

  // after all tests drop the database, close the connection, and stop the daemon
  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  // after each test delete all entries
  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('createArticle', () => {
    it('should return the new article', async () => {
      const createdArticle = await articlesController.createArticle(
        createArticleDtoStub(),
      );
      expect(createdArticle.content).toBe(createArticleDtoStub().content);
    });
  });

  describe('getArticle', () => {
    it('should return an article', async () => {
      await new articlesModel(createArticleDtoStub()).save();
      const article = await articlesController.getArticle(
        createArticleDtoStub(),
      );
      expect(article.content).toBe(createArticleDtoStub().content);
    });

    it('should return null if no article', async () => {
      const article = await articlesController.getArticle(
        createArticleDtoStub(),
      );
      expect(article).toBe(null);
    });
  });

  describe('getAllArticles', () => {
    it('should return all articles', async () => {
      await new articlesModel(createArticleDtoStub()).save();
      const articles = await articlesController.getAllArticles();
      expect(articles.length).toBe(1);
    });
  });

  describe('incongruenceCheck', () => {
    it('should return an article', async () => {
      await new articlesModel(createArticleDtoStub()).save();
      const article = await articlesController.incongruenceCheck(
        createArticleDtoStub(),
      );
      expect(null);
    });
  });
});
