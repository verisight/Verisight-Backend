import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { Connection, connect, Model } from 'mongoose';
import { Articles, ArticlesSchema } from './schemas/articles.schema';
import { getModelToken } from '@nestjs/mongoose';
import { createArticleDtoStub } from './stubs/create-article.dto.stub';

describe('ArticlesController', () => {
  let articlesController: ArticlesController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let articlesModel: Model<Articles>

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create(); // create a mongodb server and get the daemon
    const uri = mongod.getUri(); // get connection uri for mongodb servver
    mongoConnection = (await connect(uri)).connection;
    articlesModel = mongoConnection.model('Notes', ArticlesSchema);
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        ArticlesService,
        { provide: getModelToken(Articles.name), useValue: articlesModel } // provide notes schema model
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
      const createdArticle = await articlesController.createArticle(createArticleDtoStub());
      expect(createdArticle.content).toBe(createArticleDtoStub().content);
    });
  })

  describe('getArticle', () => {
    it('should return  article', async () => {
      await (new articlesModel(createArticleDtoStub()).save());
      const article = await articlesController.getArticle(createArticleDtoStub());
      expect(article.content).toBe(createArticleDtoStub().content);
    });
    it('should return null if no article', async () => {
      const article = await articlesController.getArticle(createArticleDtoStub());
      expect(article).toBe(null);
    });
  });
});
