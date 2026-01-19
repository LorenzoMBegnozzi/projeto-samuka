import { Controller, Get, Query } from '@nestjs/common';
import { RelatoriosService } from './relatorios.service';

@Controller('relatorios')
export class RelatoriosController {
	constructor(private readonly relatoriosService: RelatoriosService) {}

	@Get('vendas-por-periodo')
	async getVendasPorPeriodo(
		@Query('data_inicio') dataInicio: string,
		@Query('data_fim') dataFim: string,
	) {
		return this.relatoriosService.vendasPorPeriodo(dataInicio, dataFim);
	}

	@Get('ranking-clientes')
	async getRankingClientes(
		@Query('data_inicio') dataInicio: string,
		@Query('data_fim') dataFim: string,
	) {
		return this.relatoriosService.rankingClientes(dataInicio, dataFim);
	}
}
