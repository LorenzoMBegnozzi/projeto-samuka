import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DatabaseService } from '../database/database.service';

@Controller('vendedores')
@UseGuards(JwtAuthGuard)
export class VendedorController {
  constructor(private db: DatabaseService) {}

  @Get()
  async listar() {
    const result = await this.db.execute(
      `SELECT id, nome FROM vendedor ORDER BY nome`
    );
    
    return result.rows.map(row => ({
      id: row.ID,
      nome: row.NOME,
    }));
  }
}