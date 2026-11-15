import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const DEMO_PASSWORD = 'Password@123';

const conn = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT || 3306),
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_ADMIN_USER,
  password: process.env.MYSQL_ADMIN_PASSWORD,
});

const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
for (const table of ['admin', 'trainer', 'member']) {
  const [res] = await conn.query(`UPDATE ${table} SET password_hash = ?`, [hash]);
  console.log(`${table}: ${res.affectedRows} rows updated`);
}
await conn.end();
