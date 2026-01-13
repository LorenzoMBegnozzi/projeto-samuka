import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VendaOnlineService } from './venda-online.service';
import { CriarVendaDto } from './dto/criar-venda.dto';

@Controller('venda-online')
@UseGuards(JwtAuthGuard)
export class VendaOnlineController {
  constructor(private vendaService: VendaOnlineService) {}

  @Post()
  async criar(@Body() dto: CriarVendaDto) {
    return this.vendaService.criarVenda(dto);
  }
}