import * as dotenv from 'dotenv';
import * as postgres from 'postgres'

dotenv.config();
  
const sql = postgres({
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    ssl: 'require',
  });
  
  async function main() {
    try {
      const users = await sql`SELECT * FROM users`;
      console.log('Пользователи:', users);
    } catch (error) {
      console.error('Ошибка запроса:', error);
    } finally {
      await sql.end();
    }
  }
  
  main();