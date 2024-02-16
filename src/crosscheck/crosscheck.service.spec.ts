import { Test, TestingModule } from '@nestjs/testing';
import { CrosscheckService } from './crosscheck.service';

describe('CrosscheckService', () => {
  let service: CrosscheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrosscheckService],
    }).compile();

    service = module.get<CrosscheckService>(CrosscheckService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
