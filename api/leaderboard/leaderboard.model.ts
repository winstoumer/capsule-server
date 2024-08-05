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

interface LeaderboardRecord {
    telegram_id: number;
    points: number;
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

const getCurrentEventId = async (): Promise<number> => {
    try {
        const result = await sql`
            SELECT id FROM events
            WHERE start_date <= CURRENT_DATE
            AND end_date >= CURRENT_DATE
            LIMIT 1;
        `;
        if (result.length === 0) {
            throw new Error('Нет текущего события');
        }
        return result[0].id;
    } catch (error) {
        console.error('Ошибка при получении текущего eventId:', error);
        throw error;
    }
};

export const upsertPoints = async (telegramId: number, newPoints: number): Promise<void> => {
    try {
        // 1. Получаем текущий event_id
        const eventId = await getCurrentEventId();

        await sql.begin(async transaction => {
            // 2. Получаем данные о текущих записях для данного события
            const currentRecords = await transaction<LeaderboardRecord[]>`
                SELECT * FROM leaderboard
                WHERE event_id = ${eventId}
                ORDER BY points DESC;
            `;

            // 3. Проверяем, существует ли запись для данного пользователя
            const existingRecord = currentRecords.find(record => record.telegram_id === telegramId);

            if (existingRecord) {
                // 3.1 Если запись существует и новые points больше текущих, обновляем запись
                if (newPoints > existingRecord.points) {
                    await transaction`
                        UPDATE leaderboard
                        SET points = ${newPoints}
                        WHERE telegram_id = ${telegramId} AND event_id = ${eventId};
                    `;
                }
            } else {
                // 3.2 Если запись не существует, добавляем её
                await transaction`
                    INSERT INTO leaderboard (telegram_id, event_id, points)
                    VALUES (${telegramId}, ${eventId}, ${newPoints});
                `;
            }

            // 4. Пересчитываем места и присваиваем их записям
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
                WHERE leaderboard.telegram_id = Ranked.telegram_id
                AND leaderboard.event_id = Ranked.event_id;
            `;
        });

        console.log('Баллы обновлены и места пересчитаны');
    } catch (error) {
        console.error('Ошибка при обновлении или добавлении записи и пересчете мест:', error);
        throw error;
    }
};
