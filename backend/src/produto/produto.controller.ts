import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DatabaseService } from '../database/database.service';

@Controller('produtos')
@UseGuards(JwtAuthGuard)
export class ProdutoController {
  constructor(private db: DatabaseService) {}

  @Get()
  async listar() {
    const result = await this.db.execute(
      `SELECT id, nome, 
              NVL(preco_venda, custo) as preco_venda,
              NVL(permite_desconto, 'N') as permite_desconto,
              estoque
       FROM produto 
       ORDER BY nome`
    );
    
    return result.rows.map(row => ({
      id: row.ID,
      nome: row.NOME,
      preco_venda: row.PRECO_VENDA,
      permite_desconto: row.PERMITE_DESCONTO === 'S',
      estoque: row.ESTOQUE,
    }));
  }
}