import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CriarVendaDto } from './dto/criar-venda.dto';
import * as oracledb from 'oracledb';

@Injectable()
export class VendaOnlineService {
  constructor(private db: DatabaseService) {}

  async criarVenda(dto: CriarVendaDto) {
    let connection: oracledb.Connection;
    
    try {
      connection = await this.db.getConnection();
      
      // Validar produtos e regras de desconto
      for (const item of dto.itens) {
        const prodResult = await connection.execute(
          `SELECT id, preco_venda, permite_desconto 
           FROM produto 
           WHERE id = :id`,
          { id: item.produto_id },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        if (!prodResult.rows || prodResult.rows.length === 0) {
          throw new BadRequestException(`Produto ${item.produto_id} não encontrado`);
        }
        
        const produto = prodResult.rows[0];
        
        // Verificar se permite desconto
        if (item.desconto && produto.PERMITE_DESCONTO !== 'S') {
          throw new BadRequestException(
            `Produto ${item.produto_id} não permite desconto`
          );
        }
      }
      
      // Inserir cabeçalho da venda
      const vendaResult = await connection.execute(
        `INSERT INTO venda_online (id_vendedor, id_cliente, data)
         VALUES (:vendedor_id, :cliente_id, SYSDATE)
         RETURNING id INTO :id`,
        {
          vendedor_id: dto.vendedor_id,
          cliente_id: dto.cliente_id,
          id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: false, outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      const vendaId = vendaResult.outBinds.id[0];
      
      // Inserir itens da venda
      for (const item of dto.itens) {
        const precoFinal = item.desconto 
          ? item.preco_unitario - item.desconto 
          : item.preco_unitario;
          
        await connection.execute(
          `INSERT INTO venda_online_produto 
           (id_venda_online, id_produto, quantidade, preco_unitario)
           VALUES (:venda_id, :produto_id, :quantidade, :preco)`,
          {
            venda_id: vendaId,
            produto_id: item.produto_id,
            quantidade: item.quantidade,
            preco: precoFinal,
          },
          { autoCommit: false }
        );
      }
      
      // Commit da transação
      await connection.commit();
      
      return {
        id: vendaId,
        mensagem: 'Venda registrada com sucesso',
      };
      
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
}