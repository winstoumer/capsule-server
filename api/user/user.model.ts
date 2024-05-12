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
        await sql`
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

async function getUserByTelegramIdWithInfo(telegramId: number): Promise<UserWithInfo | null> {
    try {
        const result = await sql<UserWithInfo[]>`
            SELECT user.*, user_matter.balance, user_matter.level
            FROM user
            LEFT JOIN user_matter ON user.telegram_id = user_matter.telegram_id
            WHERE user.telegram_id = ${telegramId}
        `;
        return result[0] || null;
    } catch (error) {
        console.error('Ошибка при получении данных пользователя с информацией о балансе и уровне:', error);
        return null;
    }
}

export { User, UserWithInfo, getUserByTelegramId, updateUserFirstName, getUserByTelegramIdWithInfo };