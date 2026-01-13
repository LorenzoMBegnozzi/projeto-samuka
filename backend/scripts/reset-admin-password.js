/*
  Reseta (ou cria) o usuário admin no Oracle, usando bcrypt.

  Uso:
    node scripts/reset-admin-password.js

  Variáveis (opcionais):
    ORACLE_USER, ORACLE_PASSWORD, ORACLE_CONNECTION
    ADMIN_USUARIO (default: admin)
    ADMIN_SENHA (default: admin123)
    ADMIN_NOME (default: Administrador)
*/

const oracledb = require('oracledb');
const bcrypt = require('bcrypt');

async function main() {
  const oracleUser = process.env.ORACLE_USER || 'VENDA_APP';
  const oraclePassword = process.env.ORACLE_PASSWORD || '123';
  const oracleConnection = process.env.ORACLE_CONNECTION || 'localhost:1521/XEPDB1';

  const adminUsuario = process.env.ADMIN_USUARIO || 'admin';
  const adminSenha = process.env.ADMIN_SENHA || 'admin123';
  const adminNome = process.env.ADMIN_NOME || 'Administrador';

  const senhaHash = await bcrypt.hash(adminSenha, 10);

  let connection;
  try {
    connection = await oracledb.getConnection({
      user: oracleUser,
      password: oraclePassword,
      connectString: oracleConnection,
    });

    const existing = await connection.execute(
      `SELECT id FROM usuario WHERE usuario = :usuario`,
      { usuario: adminUsuario },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (existing.rows && existing.rows.length > 0) {
      await connection.execute(
        `UPDATE usuario
         SET senha_hash = :senha_hash,
             nome = :nome
         WHERE usuario = :usuario`,
        {
          senha_hash: senhaHash,
          nome: adminNome,
          usuario: adminUsuario,
        },
        { autoCommit: true }
      );

      console.log(`✅ Senha do usuário '${adminUsuario}' atualizada.`);
      return;
    }

    await connection.execute(
      `INSERT INTO usuario (usuario, senha_hash, nome)
       VALUES (:usuario, :senha_hash, :nome)`,
      {
        usuario: adminUsuario,
        senha_hash: senhaHash,
        nome: adminNome,
      },
      { autoCommit: true }
    );

    console.log(`✅ Usuário '${adminUsuario}' criado.`);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

main().catch((err) => {
  console.error('❌ Falha ao resetar admin:', err);
  process.exitCode = 1;
});
