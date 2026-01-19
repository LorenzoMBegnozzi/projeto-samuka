"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelatoriosService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let RelatoriosService = class RelatoriosService {
    constructor(db) {
        this.db = db;
    }
    async vendasPorPeriodo(dataInicio, dataFim) {
        function toDDMMYYYY(dateStr) {
            if (!dateStr)
                return '';
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr))
                return dateStr;
            const d = new Date(dateStr);
            if (isNaN(d.getTime()))
                return dateStr;
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
    async rankingClientes(dataInicio, dataFim) {
        function toDDMMYYYY(dateStr) {
            if (!dateStr)
                return '';
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr))
                return dateStr;
            const d = new Date(dateStr);
            if (isNaN(d.getTime()))
                return dateStr;
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
};
exports.RelatoriosService = RelatoriosService;
exports.RelatoriosService = RelatoriosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], RelatoriosService);
//# sourceMappingURL=relatorios.service.js.map