// user.model.ts

import { sql } from '../database';

interface User {
    id: number;
    user_id: string;
    telegram_id: number;
    first_name: string;
    time: Date;
    time_update: Date;
    active: boolean;
}

async function getUserByTelegramId(telegramId: number): Promise<User | null> {
    try {
        const result = await sql<User[]>`
        SELECT *
        FROM user
        WHERE telegram_id = ${telegramId}
      `;
        return result[0] || null;
    } catch (error) {
        console.error('Ошибка при получении данных пользователя по telegram_id:', error);
        return null;
    }
}

async function updateUserFirstName(telegramId: number, firstName: string): Promise<boolean> {
    try {
        const result = await sql`
      UPDATE user
      SET first_name = ${firstName}, time_update = NOW()
      WHERE telegram_id = ${telegramId}
    `;
        return true;
    } catch (error) {
        console.error('Ошибка при обновлении имени пользователя:', error);
        return false;
    }
}

export { User, getUserByTelegramId, updateUserFirstName };
