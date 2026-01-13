import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as oracledb from 'oracledb';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: oracledb.Pool;

  async onModuleInit() {
    // Configurar Oracle para retornar números como Number (não String)
    oracledb.fetchAsString = [];
    
    this.pool = await oracledb.createPool({
      user: process.env.ORACLE_USER || 'seu_usuario',
      password: process.env.ORACLE_PASSWORD || 'sua_senha',
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

  async getConnection(): Promise<oracledb.Connection> {
    return this.pool.getConnection();
  }

  async execute(sql: string, binds: any = {}, options: any = {}): Promise<any> {
    let connection: oracledb.Connection;
    try {
      connection = await this.getConnection();
      const result = await connection.execute(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        autoCommit: true,
        ...options,
      });
      return result;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
}