// currentMining.model.ts

import { sql } from '../database';

async function getCurrentMiningByTelegramId(telegramId: number): Promise<any | null> {
    try {
        const result = await sql`
            SELECT current_mining.*, matter.time_mine AS matter_time_mine
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

async function updateCurrentMiningByTelegramId(telegramId: number, matterId: number): Promise<boolean> {
    try {
        const matterTime = await sql<{ time_mine: number }[]>`
            SELECT time_mine FROM matter WHERE matter_id = ${matterId}
        `;
        
        const currentTime = new Date();
        const nextTime = new Date(currentTime);
        
        // Добавляем интервал времени к текущему времени для next_time
        nextTime.setHours(nextTime.getHours() + matterTime[0]?.time_mine);

        await sql`
            UPDATE current_mining
            SET matter_id = ${matterId}, time = NOW(), next_time = ${nextTime}
            WHERE telegram_id = ${telegramId}
        `;
        return true;
    } catch (error) {
        console.error('Ошибка при обновлении данных о текущем майнинге:', error);
        return false;
    }
}

export { getCurrentMiningByTelegramId, updateCurrentMiningByTelegramId };
