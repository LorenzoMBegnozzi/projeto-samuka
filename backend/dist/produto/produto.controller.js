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
exports.ProdutoController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const database_service_1 = require("../database/database.service");
let ProdutoController = class ProdutoController {
    constructor(db) {
        this.db = db;
    }
    async listar() {
        const result = await this.db.execute(`SELECT id, nome, 
              NVL(preco_venda, custo) as preco_venda,
              NVL(permite_desconto, 'N') as permite_desconto,
              estoque
       FROM produto 
       ORDER BY nome`);
        return result.rows.map(row => ({
            id: row.ID,
            nome: row.NOME,
            preco_venda: row.PRECO_VENDA,
            permite_desconto: row.PERMITE_DESCONTO === 'S',
            estoque: row.ESTOQUE,
        }));
    }
};
exports.ProdutoController = ProdutoController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProdutoController.prototype, "listar", null);
exports.ProdutoController = ProdutoController = __decorate([
    (0, common_1.Controller)('produtos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ProdutoController);
//# sourceMappingURL=produto.controller.js.map