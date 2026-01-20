import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as oracledb from 'oracledb';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: oracledb.Pool;

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

  async getConnection(): Promise<oracledb.Connection> {
    return this.pool.getConnection();
  }

  async execute(
    sql: string,
    binds: oracledb.BindParameters = {},
    options: oracledb.ExecuteOptions = {},
  ): Promise<oracledb.Result<unknown>> {
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

  /**
   * Executa uma query e retorna apenas os dados (rows)
   */
  async query(
    sql: string,
    binds: oracledb.BindParameters = {},
    options: oracledb.ExecuteOptions = {},
  ): Promise<any[]> {
    const result = await this.execute(sql, binds, options);
    return result.rows || [];
  }
}
