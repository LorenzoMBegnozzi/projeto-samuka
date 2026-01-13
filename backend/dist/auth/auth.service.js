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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const database_service_1 = require("../database/database.service");
let AuthService = class AuthService {
    constructor(db, jwtService) {
        this.db = db;
        this.jwtService = jwtService;
    }
    async login(loginDto) {
        const { usuario, senha } = loginDto;
        const result = await this.db.execute(`SELECT id, usuario, senha_hash, nome FROM usuario WHERE usuario = :usuario`, { usuario });
        if (!result.rows || result.rows.length === 0) {
            throw new common_1.UnauthorizedException('Usuário ou senha inválidos');
        }
        const row = result.rows[0];
        const senhaHash = row.SENHA_HASH ?? row.senha_hash;
        const userId = row.ID ?? row.id;
        const userUsuario = row.USUARIO ?? row.usuario;
        const userNome = row.NOME ?? row.nome;
        if (typeof senhaHash !== 'string') {
            throw new common_1.UnauthorizedException('Usuário ou senha inválidos');
        }
        let senhaValida = false;
        try {
            senhaValida = await bcrypt.compare(senha, senhaHash);
        }
        catch {
            senhaValida = false;
        }
        if (!senhaValida) {
            throw new common_1.UnauthorizedException('Usuário ou senha inválidos');
        }
        const payload = {
            sub: userId,
            usuario: userUsuario,
            nome: userNome,
        };
        return {
            access_token: this.jwtService.sign(payload),
            usuario: {
                id: userId,
                usuario: userUsuario,
                nome: userNome,
            },
        };
    }
    async validarToken(payload) {
        return {
            id: payload.sub,
            usuario: payload.usuario,
            nome: payload.nome
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map