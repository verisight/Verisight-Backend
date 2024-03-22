import { Test, TestingModule } from '@nestjs/testing';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';
import { CreateArticleDto } from '../articles/dto/create-article.dto';
import { ArticlesService } from '../articles/articles.service';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Connection, Model, connect } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Articles, ArticlesSchema } from '../articles/schemas/articles.schema';

describe('SummaryController', () => {
  let controller: SummaryController;
  let summaryService: SummaryService;
  let articleService: ArticlesService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let articlesModel: Model<Articles>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    articlesModel = mongoConnection.model('Articles', ArticlesSchema);
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SummaryController],
      providers: [
        SummaryService,
        ArticlesService,
        { provide: ConfigService, useValue: {} }, // provide a mock ConfigService
        { provide: getModelToken(Articles.name), useValue: articlesModel },
      ],
    }).compile();

    controller = module.get<SummaryController>(SummaryController);
    summaryService = module.get<SummaryService>(SummaryService);
    articleService = module.get<ArticlesService>(ArticlesService);
  });

  afterEach(async () => {
    await articlesModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createSummary', () => {
    it('should create a summary', async () => {
      const createArticleDto: CreateArticleDto = {
        link: 'https://example.com/article',
        title: '',
        content: '',
        datePublished: '',
        prediction: 0,
      };

      const findArticleByDtoSpy = jest
        .spyOn(articleService, 'findArticleByDto')
        .mockResolvedValueOnce({ id: '1', title: 'Test Article' });

      const createSummarySpy = jest
        .spyOn(summaryService, 'createSummary')
        .mockResolvedValueOnce({ id: '1', content: 'Test Summary' });

      const result = await controller.createSummary(createArticleDto);

      expect(findArticleByDtoSpy).toHaveBeenCalledWith(createArticleDto);
      expect(createSummarySpy).toHaveBeenCalledWith({
        id: '1',
        title: 'Test Article',
      });
      expect(result).toEqual({ id: '1', content: 'Test Summary' });
    });

    it('should throw an error if createArticleDto does not have a link', async () => {
      const createArticleDto: CreateArticleDto = {
        link: '',
        title: '',
        content: '',
        datePublished: '',
        prediction: 0,
      };

      await expect(
        controller.createSummary(createArticleDto),
      ).rejects.toThrowError('Invalid article data');
    });
  });
});
