// currentMining.model.ts

import { sql } from '../database';

interface CurrentMiningData {
    id: number;
    user_id: string;
    telegram_id: number;
    time: Date;
    next_time: Date;
    matter_id: number;
    nft_mined: boolean;
    time_end_mined_nft: Date;
    matter_data: any;
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
async function updateCurrentMiningByTelegramId(telegramId: number, matter_id: number, nft_mined: boolean, time_end_mined_nft: Date): Promise<void> {
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
                    SET time = NOW(), next_time = ${nextTime}, matter_id = ${matter_id}, nft_mined = ${nft_mined}, time_end_mined_nft = ${time_end_mined_nft}
                    WHERE telegram_id = ${telegramId}
                `;
            } else {
                console.error('Данные о времени майнинга не найдены для matter_id:', matter_id);
            }
    } catch (error) {
        console.error('Ошибка при обновлении данных о текущем майнинге:', error);
    }
}

export { getCurrentMiningByTelegramId, updateCurrentMiningByTelegramId };
