import { Module } from '@nestjs/common';
import { CrosscheckService } from './crosscheck.service';
import { CrosscheckController } from './crosscheck.controller';

@Module({
  providers: [CrosscheckService],
  controllers: [CrosscheckController]
})
export class CrosscheckModule {}
