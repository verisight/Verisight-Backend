import { Module } from '@nestjs/common';
import { CrosscheckController } from './crosscheck.controller';
import { CrosscheckService } from './crosscheck.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [CrosscheckController],
  providers: [CrosscheckService],
})
export class CrosscheckModule {}
