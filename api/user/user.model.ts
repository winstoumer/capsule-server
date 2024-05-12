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

interface UserWithInfo extends User {
    balance: number;
    level: number;
}

async function getUserByTelegramId(telegramId: number): Promise<User | null> {
    try {
        const result = await sql<User[]>`
            SELECT *
            FROM users
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
        await sql`
            UPDATE users
            SET first_name = ${firstName}, time_update = NOW()
            WHERE telegram_id = ${telegramId}
        `;
        return true;
    } catch (error) {
        console.error('Ошибка при обновлении имени пользователя:', error);
        return false;
    }
}

async function getUserInfoByTelegramId(telegramId: number): Promise<any | null> {
    try {
        const result = await sql`
            SELECT balance.balance, user_matter.matter_id, matter.*
            FROM balance
            INNER JOIN user_matter ON balance.telegram_id = user_matter.telegram_id
            INNER JOIN matter ON user_matter.matter_id = matter.matter_id
            WHERE balance.telegram_id = ${telegramId}
        `;
        return result || null;
    } catch (error) {
        console.error('Ошибка при получении данных пользователя по telegram_id:', error);
        return null;
    }
}

export { User, UserWithInfo, getUserByTelegramId, updateUserFirstName, getUserInfoByTelegramId };