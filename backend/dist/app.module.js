"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./auth/auth.module");
const vendedor_module_1 = require("./vendedor/vendedor.module");
const cliente_module_1 = require("./cliente/cliente.module");
const produto_module_1 = require("./produto/produto.module");
const venda_online_module_1 = require("./venda-online/venda-online.module");
const app_controller_1 = require("./app.controller");
const relatorios_module_1 = require("./relatorios/relatorios.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'seu-secret-super-seguro-aqui',
                signOptions: { expiresIn: '60m' },
            }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            vendedor_module_1.VendedorModule,
            cliente_module_1.ClienteModule,
            produto_module_1.ProdutoModule,
            venda_online_module_1.VendaOnlineModule,
            relatorios_module_1.RelatoriosModule,
        ],
        controllers: [app_controller_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map