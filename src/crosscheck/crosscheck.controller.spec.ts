// import { Test, TestingModule } from '@nestjs/testing';
// import { CrosscheckController } from './crosscheck.controller';

// describe('CrosscheckController', () => {
//   let controller: CrosscheckController;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [CrosscheckController],
//     }).compile();

//     controller = module.get<CrosscheckController>(CrosscheckController);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });
// });

import { Test, TestingModule } from '@nestjs/testing';
import { CrosscheckController } from './crosscheck.controller';
import { CrosscheckService } from './crosscheck.service';
import { CreateArticleDto } from '../articles/dto/create-article.dto';
import { ConfigService } from '@nestjs/config';

describe('CrosscheckController', () => {
  let controller: CrosscheckController;
  let service: CrosscheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrosscheckController],
      providers: [
        CrosscheckService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              switch (key) {
                case 'CROSSCHECK_API_KEY':
                  return 'mock-key';
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

    controller = module.get<CrosscheckController>(CrosscheckController);
    service = module.get<CrosscheckService>(CrosscheckService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('CrossCheck', () => {
    it('should call crosscheckService.getCrosscheck and return the result', async () => {
      // Arrange
      const article: CreateArticleDto = {
        link: '',
        title: '',
        content: '',
        datePublished: '',
        prediction: 0,
      }; // Add your test data here

      const expectedResult = {}; // Add your expected result here
      jest.spyOn(service, 'getCrosscheck').mockResolvedValue(expectedResult);

      // Act
      const result = await controller.CrossCheck(article);

      // Assert
      expect(service.getCrosscheck).toHaveBeenCalledWith(article);
      expect(result).toBe(expectedResult);
    });
  });
});
