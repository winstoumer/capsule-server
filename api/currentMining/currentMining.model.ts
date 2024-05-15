// currentMining.model.ts

import { sql } from '../database';

interface CurrentMiningData {
    id: number;
    user_id: string;
    telegram_id: number;
    time: Date;
    next_time: Date;
    matter_id: number;
    matter_data: any;
}

interface CurrentMiningRecord {
    id: number;
    user_id: string; // uuid
    telegram_id: number;
    time: Date;
    next_time: Date;
    matter_id: number;
}

async function getCurrentMiningByTelegramId(telegramId: number): Promise<CurrentMiningData | null> {
    try {
        const result = await sql<CurrentMiningData[]>`
            SELECT current_mining.*, matter.*
            FROM current_mining
            LEFT JOIN matter ON current_mining.matter_id = matter.matter_id
            WHERE current_mining.telegram_id = ${telegramId}
        `;
        return result[0] || null;
    } catch (error) {
        console.error('Ошибка при получении данных о текущем майнинге по telegram_id:', error);
        return null;
    }
}

// Функция для обновления записи о текущем майнинге
async function updateCurrentMiningByTelegramId(telegram_id: number, matter_id: number): Promise<void> {
    try {
        const matterTime = await sql<{ time_mine: number }[]>`
                SELECT time_mine FROM matter WHERE matter_id = ${matter_id}
            `;

            if (matterTime.length > 0) {
                const time_mine = matterTime[0].time_mine;
                const currentTime = new Date();
            
                // Добавляем 1 час к текущему времени для nextTime
                const nextTime = new Date(currentTime.getTime() + time_mine * 60 * 60 * 1000);
            
                // Обновляем запись в таблице current_mining
                await sql`
                    UPDATE current_mining
                    SET matter_id = ${matter_id}, time = NOW(), next_time = ${nextTime}
                    WHERE telegram_id = ${telegram_id}
                `;
            } else {
                console.error('Данные о времени майнинга не найдены для matter_id:', matter_id);
            }
    } catch (error) {
        console.error('Ошибка при обновлении данных о текущем майнинге:', error);
    }
}

export { getCurrentMiningByTelegramId, updateCurrentMiningByTelegramId };
