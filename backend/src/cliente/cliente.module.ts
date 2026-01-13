import { Module } from '@nestjs/common';
import { ClienteController } from './cliente.controller';

@Module({
  controllers: [ClienteController],
})
export class ClienteModule {}