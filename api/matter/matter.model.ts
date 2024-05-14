// matter.model.ts

import { sql } from '../database';

interface Matter {
    id: number;
    matter_id: number;
    level: number;
    price: number;
    time_mine: number;
    coins_mine: number;
    nft_active: boolean;
    active: boolean;
}

interface UserMatter {
    id: number;
    user_id: number;
    telegram_id: number;
    matter_id: number;
    time: Date;
    time_update: Date;
    active: boolean;
}

async function getAllActiveMatter(): Promise<Matter[]> {
    try {
        const activeMatter = await sql<Matter[]>`
            SELECT *
            FROM matter
            WHERE active = true
        `;
        return activeMatter;
    } catch (error) {
        console.error('Ошибка при получении списка активных элементов:', error);
        throw error;
    }
}

async function updateUserMatterByTelegramId(telegram_id: number, matter_id: number): Promise<void> {
    try {
        const time_update = new Date();
        await sql`
            UPDATE user_matter
            SET matter_id = ${matter_id}, time_update = ${time_update}
            WHERE telegram_id = ${telegram_id}
        `;
    } catch (error) {
        console.error('Ошибка при обновлении записи в таблице user_matter:', error);
        throw error;
    }
}

export { Matter, UserMatter,  getAllActiveMatter, updateUserMatterByTelegramId };
