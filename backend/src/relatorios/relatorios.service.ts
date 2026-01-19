import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class RelatoriosService {
  constructor(private readonly db: DatabaseService) { }

  async vendasPorPeriodo(dataInicio: string, dataFim: string) {
    // Função para converter para DD/MM/YYYY
    function toDDMMYYYY(dateStr: string): string {
      if (!dateStr) return '';
      // Se já estiver no formato correto, retorna
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
      // Aceita formatos ISO ou Date
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }

    const dataInicioFmt = toDDMMYYYY(dataInicio);
    const dataFimFmt = toDDMMYYYY(dataFim);

    const query = `
    SELECT 
      TO_CHAR(vo.data, 'YYYY-MM-DD') as data_venda,
      NVL(SUM(vop.quantidade * vop.preco_unitario), 0) as valor_venda,
      c.nome as empresa,
      v.nome as vendedor
    FROM venda_online vo
    LEFT JOIN venda_online_produto vop ON vop.id_venda_online = vo.id
    INNER JOIN cliente c ON c.id = vo.id_cliente
    INNER JOIN vendedor v ON v.id = vo.id_vendedor
    WHERE TRUNC(vo.data) BETWEEN 
          TO_DATE(:dataInicio, 'DD/MM/YYYY') 
      AND TO_DATE(:dataFim, 'DD/MM/YYYY')
    GROUP BY TO_CHAR(vo.data, 'YYYY-MM-DD'), c.nome, v.nome
    ORDER BY data_venda, empresa, vendedor
  `;

    const rows = await this.db.query(query, [dataInicioFmt, dataFimFmt]);

    return rows.map(row => ({
      data_venda: row.DATA_VENDA ?? row.data_venda,
      valor_venda: row.VALOR_VENDA ?? row.valor_venda,
      empresa: row.EMPRESA ?? row.empresa,
      vendedor: row.VENDEDOR ?? row.vendedor,
    }));
  }



  async rankingClientes(dataInicio: string, dataFim: string) {
    function toDDMMYYYY(dateStr: string): string {
      if (!dateStr) return '';
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }

    const dataInicioFmt = toDDMMYYYY(dataInicio);
    const dataFimFmt = toDDMMYYYY(dataFim);

    const query = `
      SELECT
        c.nome as cliente,
        NVL(SUM(vop.quantidade * vop.preco_unitario), 0) as valor_total
      FROM venda_online vo
      LEFT JOIN venda_online_produto vop ON vop.id_venda_online = vo.id
      INNER JOIN cliente c ON c.id = vo.id_cliente
      WHERE TRUNC(vo.data) BETWEEN TO_DATE(:dataInicio, 'DD/MM/YYYY') AND TO_DATE(:dataFim, 'DD/MM/YYYY')
      GROUP BY c.nome
      ORDER BY valor_total DESC
    `;

    const rows = await this.db.query(query, [dataInicioFmt, dataFimFmt]);
    return rows.map(row => ({
      cliente: row.CLIENTE ?? row.cliente,
      valor_total: row.VALOR_TOTAL ?? row.valor_total,
    }));
  }
}
