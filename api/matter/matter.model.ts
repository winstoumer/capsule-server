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

export { Matter, getAllActiveMatter };
