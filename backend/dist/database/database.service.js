"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const oracledb = require("oracledb");
let DatabaseService = class DatabaseService {
    async onModuleInit() {
        oracledb.fetchAsString = [];
        this.pool = await oracledb.createPool({
            user: process.env.ORACLE_USER || 'VENDA_APP',
            password: process.env.ORACLE_PASSWORD || '123',
            connectString: process.env.ORACLE_CONNECTION || 'localhost:1521/XEPDB1',
            poolMin: 2,
            poolMax: 10,
            poolIncrement: 1,
        });
        console.log('✅ Pool de conexões Oracle criado');
    }
    async onModuleDestroy() {
        if (this.pool) {
            await this.pool.close();
            console.log('🔒 Pool de conexões Oracle fechado');
        }
    }
    async getConnection() {
        return this.pool.getConnection();
    }
    async execute(sql, binds = {}, options = {}) {
        let connection;
        try {
            connection = await this.getConnection();
            const result = await connection.execute(sql, binds, {
                outFormat: oracledb.OUT_FORMAT_OBJECT,
                autoCommit: true,
                ...options,
            });
            return result;
        }
        finally {
            if (connection) {
                await connection.close();
            }
        }
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = __decorate([
    (0, common_1.Injectable)()
], DatabaseService);
//# sourceMappingURL=database.service.js.map