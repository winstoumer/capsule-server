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
    place?: number;
    rewards?: Reward[]; // Виртуальное поле для наград
}

export class LeaderboardModel {
    static async getLeaderboard(eventId: number): Promise<LeaderboardEntry[]> {
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
            const rewards: Reward[] = [];
            if (reward.coins) rewards.push({ type: 'coins', value: reward.coins.toString() });
            if (reward.multiplier) rewards.push({ type: 'multiplier', value: reward.multiplier });
            if (reward.ton) rewards.push({ type: 'ton', value: reward.ton + 'TON' });
            rewardsMap.set(reward.place, rewards);
        }

        return leaderboardResult.map((row: any) => {
            const rewards = rewardsMap.get(parseInt(row.place)) || [];
            return {
                telegram_id: row.telegram_id,
                first_name: row.first_name,
                points: row.points,
                event_id: eventId,
                place: row.place,
                rewards: rewards // Добавляем виртуальное поле для наград
            };
        });
    }

    static async addOrUpdateEntry(telegram_id: number, points: number): Promise<void> {
        const currentDate = new Date();

        // Получаем first_name из таблицы users
        const userResult = await sql`
            SELECT first_name
            FROM users
            WHERE telegram_id = ${telegram_id}
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
            VALUES (${telegram_id}, ${firstName}, ${points}, ${eventId})
            ON CONFLICT (telegram_id, event_id) DO UPDATE
            SET points = CASE
                WHEN EXCLUDED.points > leaderboard.points THEN EXCLUDED.points
                ELSE leaderboard.points
            END
        `;
    }
}
