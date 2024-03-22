import { Test, TestingModule } from '@nestjs/testing';
import { CrosscheckService } from './crosscheck.service';
import { CreateArticleDto } from 'src/articles/dto/create-article.dto';
import { ConfigService } from '@nestjs/config';

describe('CrosscheckService', () => {
  let service: CrosscheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrosscheckService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              switch (key) {
                case 'CROSSCHECK_API_KEY':
                  return 'mock-api-key';
                case 'CROSSCHECK_API_VERSION':
                  return 'mock-api-version';
                // add other keys if needed
                default:
                  return null;
              }
            },
          },
        },
      ],
    }).compile();

    service = module.get<CrosscheckService>(CrosscheckService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCrosscheck', () => {
    it('should return the crosscheck result', async () => {
      const article: CreateArticleDto = {
        title: 'Test Article',
        content: 'This is a test article.',
        link: '',
        datePublished: '',
        prediction: 0,
      };

      const result = await service.getCrosscheck(article);

      expect(result).toBeDefined();
      // Add more assertions based on the expected result
    });
  });
});
