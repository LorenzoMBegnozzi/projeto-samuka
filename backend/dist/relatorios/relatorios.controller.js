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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelatoriosController = void 0;
const common_1 = require("@nestjs/common");
const relatorios_service_1 = require("./relatorios.service");
let RelatoriosController = class RelatoriosController {
    constructor(relatoriosService) {
        this.relatoriosService = relatoriosService;
    }
    async getVendasPorPeriodo(dataInicio, dataFim) {
        return this.relatoriosService.vendasPorPeriodo(dataInicio, dataFim);
    }
    async getRankingClientes(dataInicio, dataFim) {
        return this.relatoriosService.rankingClientes(dataInicio, dataFim);
    }
};
exports.RelatoriosController = RelatoriosController;
__decorate([
    (0, common_1.Get)('vendas-por-periodo'),
    __param(0, (0, common_1.Query)('data_inicio')),
    __param(1, (0, common_1.Query)('data_fim')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RelatoriosController.prototype, "getVendasPorPeriodo", null);
__decorate([
    (0, common_1.Get)('ranking-clientes'),
    __param(0, (0, common_1.Query)('data_inicio')),
    __param(1, (0, common_1.Query)('data_fim')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RelatoriosController.prototype, "getRankingClientes", null);
exports.RelatoriosController = RelatoriosController = __decorate([
    (0, common_1.Controller)('relatorios'),
    __metadata("design:paramtypes", [relatorios_service_1.RelatoriosService])
], RelatoriosController);
//# sourceMappingURL=relatorios.controller.js.map