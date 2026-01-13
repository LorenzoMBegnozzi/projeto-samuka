import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DatabaseService } from '../database/database.service';

@Controller('clientes')
@UseGuards(JwtAuthGuard)
export class ClienteController {
  constructor(private db: DatabaseService) {}

  @Get()
  async listar() {
    const result = await this.db.execute(
      `SELECT id, nome FROM cliente ORDER BY nome`,
    );

    return result.rows.map((row) => ({
      id: row.ID,
      nome: row.NOME,
    }));
  }

  @Get(':id/divida')
  async obterDivida(@Param('id') id: string) {
    const result = await this.db.execute(
      `SELECT NVL(SUM(valor), 0) as divida_total 
       FROM tabela_lancamento 
       WHERE id_cliente = :id`,
      { id: parseInt(id) },
    );

    const divida = result.rows[0]?.DIVIDA_TOTAL || 0;

    return {
      cliente_id: parseInt(id),
      divida: divida,
    };
  }
}
