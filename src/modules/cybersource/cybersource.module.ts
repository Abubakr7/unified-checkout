import { Module } from '@nestjs/common';
import { CybersourceController } from './cybersource.controller';
import { ApiController } from './api.controller';
import { CybersourceService } from './cybersource.service';

@Module({
  controllers: [CybersourceController, ApiController],
  providers: [CybersourceService],
  exports: [CybersourceService],
})
export class CybersourceModule {}
