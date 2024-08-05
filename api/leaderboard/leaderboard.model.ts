// api/leaderboard/leaderboard.model.ts
import { sql } from '../database';

export interface Reward {
    type: string;
    value: string;
}

export interface LeaderboardEntry {
    telegram_id: number;
    first_name: string;
    points: number;
    event_id: number;
    place?: number;  // Виртуальное поле для места
    reward?: Reward[]; // Обновлено для массива наград
}

export class LeaderboardModel {
    static async getLeaderboard(eventId: number): Promise<LeaderboardEntry[]> {
        try {
            const leaderboardResult = await sql`
                SELECT 
                    telegram_id, 
                    first_name, 
                    points, 
                    ROW_NUMBER() OVER (ORDER BY points DESC) AS place
                FROM leaderboard
                WHERE event_id = ${eventId}
                ORDER BY points DESC
                LIMIT 200
            `;

            const rewardsResult = await sql`
                SELECT place, coins, multiplier, ton
                FROM leaderboard_rewards
            `;

            // Сопоставляем награды с местами
            const rewardsMap = new Map<number, Reward[]>();
            for (const reward of rewardsResult) {
                const rewardList: Reward[] = [];
                if (reward.coins !== null) rewardList.push({ type: 'coins', value: reward.coins.toString() });
                if (reward.multiplier !== null) rewardList.push({ type: 'multiplier', value: reward.multiplier });
                if (reward.ton !== null) rewardList.push({ type: 'ton', value: reward.ton });
                rewardsMap.set(reward.place, rewardList);
            }

            return leaderboardResult.map((row: any) => {
                const reward = rewardsMap.get(row.place) || [];

                return {
                    telegram_id: row.telegram_id,
                    first_name: row.first_name,
                    points: row.points,
                    event_id: eventId,
                    place: row.place,
                    reward: reward // Добавляем виртуальное поле для награды
                };
            });
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            throw new Error('Failed to fetch leaderboard');
        }
    }

    static async addOrUpdateEntry(telegramId: number, points: number): Promise<void> {
        try {
            const currentDate = new Date();

            // Получаем first_name из таблицы users
            const userResult = await sql`
                SELECT first_name
                FROM users
                WHERE telegram_id = ${telegramId}
            `;

            if (userResult.length === 0) {
                throw new Error('User not found');
            }

            const firstName = userResult[0].first_name;

            // Получаем event_id и проверяем его даты
            const eventResult = await sql`
                SELECT id, start_date, end_date
                FROM events
                WHERE start_date <= ${currentDate} AND end_date >= ${currentDate}
                LIMIT 1
            `;

            if (eventResult.length === 0) {
                throw new Error('No ongoing event found');
            }

            const eventId = eventResult[0].id;

            // Вставляем или обновляем запись в таблице leaderboard
            await sql`
                INSERT INTO leaderboard (telegram_id, first_name, points, event_id)
                VALUES (${telegramId}, ${firstName}, ${points}, ${eventId})
                ON CONFLICT (telegram_id, event_id) DO UPDATE
                SET points = CASE
                    WHEN EXCLUDED.points > leaderboard.points THEN EXCLUDED.points
                    ELSE leaderboard.points
                END
            `;
        } catch (error) {
            console.error('Error adding or updating entry:', error);
            throw new Error('Failed to add or update entry');
        }
    }
}
