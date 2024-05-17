// user.model.ts

import { sql } from '../database';
import { v4 as uuidv4 } from 'uuid';

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

async function createUser(telegramId: number, first_name: string): Promise<boolean> {
    const userId = uuidv4(); // Генерация уникального идентификатора
    const currentTime = new Date();
    const nextTime = new Date(currentTime.getTime() + 1 * 60 * 60 * 1000); // Добавляем 1 час к текущему времени

    try {
        await sql.begin(async sql => {
            // Вставляем данные в таблицу users
            await sql`
                INSERT INTO users (user_id, telegram_id, first_name, time, time_update, active)
                VALUES (${userId}, ${telegramId}, ${first_name}, ${currentTime}, ${currentTime}, true)
            `;

            // Вставляем данные в таблицу balance
            await sql`
                INSERT INTO balance (user_id, telegram_id, balance, time, time_update, active)
                VALUES (${userId}, ${telegramId}, 100.00, ${currentTime}, ${currentTime}, true)
            `;

            // Вставляем данные в таблицу user_matter
            await sql`
                INSERT INTO user_matter (user_id, telegram_id, matter_id, time, time_update, action)
                VALUES (${userId}, ${telegramId}, 1, ${currentTime}, ${currentTime}, 'default_action')
            `;

            // Вставляем данные в таблицу current_mining
            await sql`
                INSERT INTO current_mining (user_id, telegram_id, time, next_time, matter_id)
                VALUES (${userId}, ${telegramId}, ${currentTime}, ${nextTime}, 1)
            `;
        });
        return true;
    } catch (error) {
        console.error('Ошибка при создании пользователя:', error);
        return false;
    }
}

export { User, UserWithInfo, getUserByTelegramId, updateUserFirstName, getUserInfoByTelegramId, createUser };