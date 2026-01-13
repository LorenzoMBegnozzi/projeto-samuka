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
exports.VendaOnlineService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const oracledb = require("oracledb");
let VendaOnlineService = class VendaOnlineService {
    constructor(db) {
        this.db = db;
    }
    async criarVenda(dto) {
        let connection;
        try {
            connection = await this.db.getConnection();
            for (const item of dto.itens) {
                const prodResult = await connection.execute(`SELECT id, preco_venda, permite_desconto 
           FROM produto 
           WHERE id = :id`, { id: item.produto_id }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
                if (!prodResult.rows || prodResult.rows.length === 0) {
                    throw new common_1.BadRequestException(`Produto ${item.produto_id} não encontrado`);
                }
                const produto = prodResult.rows[0];
                if (item.desconto && produto.PERMITE_DESCONTO !== 'S') {
                    throw new common_1.BadRequestException(`Produto ${item.produto_id} não permite desconto`);
                }
            }
            const vendaResult = await connection.execute(`INSERT INTO venda_online (id_vendedor, id_cliente, data)
         VALUES (:vendedor_id, :cliente_id, SYSDATE)
         RETURNING id INTO :id`, {
                vendedor_id: dto.vendedor_id,
                cliente_id: dto.cliente_id,
                id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            }, { autoCommit: false, outFormat: oracledb.OUT_FORMAT_OBJECT });
            const vendaId = vendaResult.outBinds.id[0];
            for (const item of dto.itens) {
                const precoFinal = item.desconto
                    ? item.preco_unitario - item.desconto
                    : item.preco_unitario;
                await connection.execute(`INSERT INTO venda_online_produto 
           (id_venda_online, id_produto, quantidade, preco_unitario)
           VALUES (:venda_id, :produto_id, :quantidade, :preco)`, {
                    venda_id: vendaId,
                    produto_id: item.produto_id,
                    quantidade: item.quantidade,
                    preco: precoFinal,
                }, { autoCommit: false });
            }
            await connection.commit();
            return {
                id: vendaId,
                mensagem: 'Venda registrada com sucesso',
            };
        }
        catch (error) {
            if (connection) {
                await connection.rollback();
            }
            throw error;
        }
        finally {
            if (connection) {
                await connection.close();
            }
        }
    }
};
exports.VendaOnlineService = VendaOnlineService;
exports.VendaOnlineService = VendaOnlineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], VendaOnlineService);
//# sourceMappingURL=venda-online.service.js.map