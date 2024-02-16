import { Module } from '@nestjs/common';
import { CrosscheckController } from './crosscheck.controller';
import { CrosscheckService } from './crosscheck.service';

@Module({
  controllers: [CrosscheckController],
  providers: [CrosscheckService]
})
export class CrosscheckModule {}
