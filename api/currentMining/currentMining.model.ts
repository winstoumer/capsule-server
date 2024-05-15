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

async function updateCurrentMiningByTelegramId(telegram_id: number, matter_id: number): Promise<boolean> {
    try {
        // Получаем время майнинга для указанного matter_id
        const matterTime = await sql<{ time_mine: number }[]>`
            SELECT time_mine FROM matter WHERE matter_id = ${matter_id}
        `;
        
        if (matterTime.length > 0) {
            const currentTime = new Date();
            const nextTime = new Date(currentTime);
            // Добавляем интервал времени к текущему времени для next_time
            nextTime.setHours(nextTime.getHours() + matterTime[0]?.time_mine);

            // Выполняем запрос на обновление записи в таблице current_mining
            await sql`
                UPDATE current_mining
                SET matter_id = ${matter_id}, time = NOW(), next_time = ${nextTime}
                WHERE telegram_id = ${telegram_id}
            `;
            return true; // Всё прошло успешно
        } else {
            console.error('Данные о времени майнинга не найдены для matter_id:', matter_id);
            return false; // Данные о времени майнинга не найдены
        }
    } catch (error) {
        console.error('Ошибка при обновлении данных о текущем майнинге:', error);
        return false; // Произошла ошибка при обновлении данных
    }
}

export { getCurrentMiningByTelegramId, updateCurrentMiningByTelegramId };
