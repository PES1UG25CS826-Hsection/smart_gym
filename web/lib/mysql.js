import mysql from 'mysql2/promise';

const ENV = {
  admin:   ['MYSQL_ADMIN_USER',   'MYSQL_ADMIN_PASSWORD'],
  trainer: ['MYSQL_TRAINER_USER', 'MYSQL_TRAINER_PASSWORD'],
  member:  ['MYSQL_MEMBER_USER',  'MYSQL_MEMBER_PASSWORD'],
  auth:    ['MYSQL_AUTH_USER',    'MYSQL_AUTH_PASSWORD'],
};

export function getPool(role) {
  if (!ENV[role]) throw new Error(`Unknown database role: ${role}`);
  globalThis.__gymPools ??= {};
  if (!globalThis.__gymPools[role]) {
    const [u, p] = ENV[role];
    globalThis.__gymPools[role] = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT || 3306),
      database: process.env.MYSQL_DATABASE,
      user: process.env[u],
      password: process.env[p],
      waitForConnections: true,
      connectionLimit: 5,
      dateStrings: true,
    });
  }
  return globalThis.__gymPools[role];
}

export async function query(role, sql, params = []) {
  const [rows] = await getPool(role).query(sql, params);
  return rows;
}
