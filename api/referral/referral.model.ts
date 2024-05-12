// referral.model.ts

import { sql } from '../database';

interface Referral {
    id: number;
    invited_id: string;
    invited_by_id: string;
    invited_telegram_id: number;
    invited_by_telegram_id: number;
    time: Date;
    active: boolean;
}

async function getInvitedCount(invitedByTelegramId: number): Promise<number> {
    try {
        const result = await sql`
        SELECT COUNT(*) AS count
        FROM referral
        WHERE invited_by_telegram_id = ${invitedByTelegramId}
      `;
        const count: number = result[0].count;
        return count;
    } catch (error) {
        console.error('Ошибка при получении количества приглашенных:', error);
        return 0;
    }
}

export { Referral, getInvitedCount };
