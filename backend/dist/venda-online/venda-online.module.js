"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendaOnlineModule = void 0;
const common_1 = require("@nestjs/common");
const venda_online_controller_1 = require("./venda-online.controller");
const venda_online_service_1 = require("./venda-online.service");
let VendaOnlineModule = class VendaOnlineModule {
};
exports.VendaOnlineModule = VendaOnlineModule;
exports.VendaOnlineModule = VendaOnlineModule = __decorate([
    (0, common_1.Module)({
        controllers: [venda_online_controller_1.VendaOnlineController],
        providers: [venda_online_service_1.VendaOnlineService],
    })
], VendaOnlineModule);
//# sourceMappingURL=venda-online.module.js.map