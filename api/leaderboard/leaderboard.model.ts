// api/leaderboard/model.ts
import { sql } from '../database';

interface Reward {
    type: string;
    value: string;
}

interface Leader {
    place: number;
    name: string;
    points: number;
    rewards: Reward[];
}

// Функция для получения текущих лидеров с наградами
export const getCurrentLeadersWithRewards = async (): Promise<Leader[]> => {
    try {
        const query = `
            SELECT 
                l.place, 
                u.first_name AS name, 
                l.points, 
                r.reward_type AS reward_type, 
                r.reward_value AS reward_value
            FROM 
                leaderboard l
            JOIN 
                users u ON l.telegram_id = u.telegram_id
            JOIN 
                events e ON l.event_id = e.id
            JOIN 
                rewards r ON l.event_id = r.event_id AND l.place = r.place
            WHERE 
                CURRENT_DATE BETWEEN e.start_date AND e.end_date
            ORDER BY 
                l.place ASC;
        `;

        // Выполнение запроса и типизация результата
        const rows = await sql<any[]>`${query}`;

        // Преобразование строк в структуру данных лидеров с наградами
        const leaders: Record<number, Leader> = {};
        rows.forEach((row: any) => {
            if (!leaders[row.place]) {
                leaders[row.place] = {
                    place: row.place,
                    name: row.name,
                    points: row.points,
                    rewards: [],
                };
            }
            leaders[row.place].rewards.push({ type: row.reward_type, value: row.reward_value });
        });

        return Object.values(leaders);
    } catch (error) {
        console.error('Ошибка при получении текущих лидеров:', error);
        throw error;
    }
};

// Функция для обновления или добавления баллов
export const upsertPoints = async (telegramId: number, newPoints: number): Promise<void> => {
    try {
        // Проверяем текущие баллы для данного telegramId
        const currentEntry = await sql<any[]>`
            SELECT points FROM leaderboard
            WHERE telegram_id = ${telegramId};
        `;

        if (currentEntry.length > 0) {
            const currentPoints = currentEntry[0].points;
            
            // Обновляем запись, если новые баллы больше текущих
            if (newPoints > currentPoints) {
                await sql`
                    UPDATE leaderboard
                    SET points = ${newPoints}
                    WHERE telegram_id = ${telegramId};
                `;
            }
        } else {
            // Добавляем новую запись, если её нет
            await sql`
                INSERT INTO leaderboard (telegram_id, points)
                VALUES (${telegramId}, ${newPoints});
            `;
        }
    } catch (error) {
        console.error('Ошибка при обновлении или добавлении записи:', error);
        throw error;
    }
};
