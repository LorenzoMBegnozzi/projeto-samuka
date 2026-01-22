import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class RelatoriosService {
  constructor(private readonly db: DatabaseService) {}

  private toDDMMYYYY(dateStr: string): string {
    if (!dateStr) return '';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  async vendasPorPeriodo(dataInicio: string, dataFim: string) {
    const dataInicioFmt = this.toDDMMYYYY(dataInicio);
    const dataFimFmt = this.toDDMMYYYY(dataFim);

    const query = `
      SELECT 
        TO_CHAR(data, 'YYYY-MM-DD') as data,
        venda,
        reserva,
        custo,
        financeiro,
        venda + reserva + financeiro AS total,
        CASE 
          WHEN venda = 0 THEN 0
          ELSE ROUND((financeiro / venda) * 100, 2)
        END AS percentual_sf
      FROM (
        SELECT 
          TRUNC(dia) AS data,
          SUM(venda) AS venda,
          SUM(reserva) AS reserva,
          SUM(custo) AS custo,
          SUM(financeiro) AS financeiro
        FROM (
          SELECT 
            vo.data AS dia,
            SUM(vop.quantidade * vop.preco_unitario) AS venda,
            SUM(vop.quantidade * p.custo) AS custo,
            0 AS reserva,
            0 AS financeiro
          FROM venda_online vo
          JOIN venda_online_produto vop ON vop.id_venda_online = vo.id
          JOIN produto p ON p.id = vop.id_produto
          WHERE TRUNC(vo.data) BETWEEN TO_DATE(:dataInicio, 'DD/MM/YYYY') AND TO_DATE(:dataFim, 'DD/MM/YYYY')
          GROUP BY vo.data

          UNION ALL

          SELECT 
            r.data AS dia,
            0,
            0,
            SUM(r.valor) AS reserva,
            0
          FROM reserva r
          WHERE r.status = 'ATIVA'
            AND TRUNC(r.data) BETWEEN TO_DATE(:dataInicio, 'DD/MM/YYYY') AND TO_DATE(:dataFim, 'DD/MM/YYYY')
          GROUP BY r.data

          UNION ALL

          SELECT 
            f.data AS dia,
            0,
            0,
            0,
            SUM(CASE WHEN f.tipo = 'ENTRADA' THEN f.valor ELSE -f.valor END) AS financeiro
          FROM financeiro f
          WHERE TRUNC(f.data) BETWEEN TO_DATE(:dataInicio, 'DD/MM/YYYY') AND TO_DATE(:dataFim, 'DD/MM/YYYY')
          GROUP BY f.data
        )
        GROUP BY TRUNC(dia)
      )
      ORDER BY data
    `;

    const rows = await this.db.query(query, {
      dataInicio: dataInicioFmt,
      dataFim: dataFimFmt,
    });

    return rows.map(row => ({
      data: row.DATA ?? row.data,
      venda: Number(row.VENDA ?? row.venda) || 0,
      reserva: Number(row.RESERVA ?? row.reserva) || 0,
      custo: Number(row.CUSTO ?? row.custo) || 0,
      financeiro: Number(row.FINANCEIRO ?? row.financeiro) || 0,
      total: Number(row.TOTAL ?? row.total) || 0,
      percentual_sf: Number(row.PERCENTUAL_SF ?? row.percentual_sf) || 0,
    }));
  }

  async rankingClientes(dataInicio: string, dataFim: string) {
    const dataInicioFmt = this.toDDMMYYYY(dataInicio);
    const dataFimFmt = this.toDDMMYYYY(dataFim);

    const query = `
      SELECT
        TO_CHAR(TRUNC(vo.data), 'DD/MM/YYYY') as data,
        c.nome as cliente_nome,
        COUNT(vo.id) as qtd_vendas,
        NVL(SUM(vop.quantidade * vop.preco_unitario), 0) as total_compras
      FROM venda_online vo
      LEFT JOIN venda_online_produto vop ON vop.id_venda_online = vo.id
      INNER JOIN cliente c ON c.id = vo.id_cliente
      WHERE TRUNC(vo.data) BETWEEN TO_DATE(:dataInicio, 'DD/MM/YYYY') AND TO_DATE(:dataFim, 'DD/MM/YYYY')
      GROUP BY TO_CHAR(TRUNC(vo.data), 'DD/MM/YYYY'), c.nome
      ORDER BY data DESC, total_compras DESC
    `;

    const rows = await this.db.query(query, {
      dataInicio: dataInicioFmt,
      dataFim: dataFimFmt,
    });

    return rows.map(row => ({
      data: row.DATA ?? row.data,
      cliente_nome: row.CLIENTE_NOME ?? row.cliente_nome,
      qtd_vendas: Number(row.QTD_VENDAS ?? row.qtd_vendas),
      total_compras: Number(row.TOTAL_COMPRAS ?? row.total_compras),
    }));
  }
}
