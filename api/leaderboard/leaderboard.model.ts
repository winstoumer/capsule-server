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
        // Получение активного события
        const activeEvent = await sql`
            SELECT id FROM events
            WHERE CURRENT_DATE BETWEEN start_date AND end_date
            LIMIT 1;
        `;

        if (activeEvent.length === 0) {
            throw new Error('Нет активных событий для получения лидеров.');
        }

        const eventId = activeEvent[0].id;

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
                rewards r ON l.event_id = r.event_id AND l.place = r.place
            WHERE 
                l.event_id = ${eventId}
            ORDER BY 
                l.points DESC, l.place ASC;
        `;

        const rows = await sql.unsafe(query);

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

export const upsertPoints = async (telegramId: number, newPoints: number, eventId: number): Promise<void> => {
    try {
        await sql.begin(async transaction => {
            // Проверка существует ли уже запись с таким event_id и place
            const existingRecord = await transaction`
                SELECT * FROM leaderboard
                WHERE telegram_id = ${telegramId} AND event_id = ${eventId};
            `;

            if (existingRecord.length > 0) {
                // Если запись существует, обновляем её, если новые points больше
                await transaction`
                    UPDATE leaderboard
                    SET points = ${newPoints}
                    WHERE telegram_id = ${telegramId} AND event_id = ${eventId}
                    AND points < ${newPoints};
                `;
            } else {
                // Если запись не существует, вставляем новую
                await transaction`
                    INSERT INTO leaderboard (telegram_id, event_id, place, points)
                    VALUES (${telegramId}, ${eventId}, (SELECT COALESCE(MAX(place), 0) + 1 FROM leaderboard WHERE event_id = ${eventId}), ${newPoints})
                `;
            }

            // Пересчет мест
            await transaction`
                WITH Ranked AS (
                    SELECT
                        telegram_id,
                        event_id,
                        points,
                        RANK() OVER (PARTITION BY event_id ORDER BY points DESC) as new_place
                    FROM leaderboard
                )
                UPDATE leaderboard
                SET place = Ranked.new_place
                FROM Ranked
                WHERE leaderboard.telegram_id = Ranked.telegram_id AND leaderboard.event_id = Ranked.event_id;
            `;
        });

        console.log('Баллы обновлены и места пересчитаны');
    } catch (error) {
        console.error('Ошибка при обновлении или добавлении записи и пересчете мест:', error);
        throw error;
    }
};
