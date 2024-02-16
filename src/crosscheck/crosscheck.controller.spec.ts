import { Test, TestingModule } from '@nestjs/testing';
import { CrosscheckController } from './crosscheck.controller';

describe('CrosscheckController', () => {
  let controller: CrosscheckController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrosscheckController],
    }).compile();

    controller = module.get<CrosscheckController>(CrosscheckController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
