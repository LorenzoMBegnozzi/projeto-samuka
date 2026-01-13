import { Module } from '@nestjs/common';
import { VendaOnlineController } from './venda-online.controller';
import { VendaOnlineService } from './venda-online.service';

@Module({
  controllers: [VendaOnlineController],
  providers: [VendaOnlineService],
})
export class VendaOnlineModule {}