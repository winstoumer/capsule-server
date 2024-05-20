// mint.model.ts
import { sql } from '../database';

interface NftMinted {
    id?: number;
    user_id?: string;
    telegram_id: number;
    nft_id: string;
    address: string;
    send_ton: string;
    collection_id: number;
    date?: Date;
    active: boolean;
  }
  
  async function insertNftMinted(nftMinted: Omit<NftMinted, 'id' | 'date'>): Promise<number> {
    const { telegram_id, nft_id, address, send_ton, collection_id, active } = nftMinted;
  
    const users = await sql<{ user_id: string }[]>`
      SELECT user_id FROM users WHERE telegram_id = ${telegram_id};
    `;
  
    if (users.length === 0) {
      throw new Error(`Пользователь с telegram_id ${telegram_id} не найден.`);
    }
  
    const user_id = users[0].user_id;
  
    const result = await sql`
      INSERT INTO nft_minted (user_id, telegram_id, nft_id, address, send_ton, collection_id, date, active)
      VALUES (${user_id}, ${telegram_id}, ${nft_id}, ${address}, ${send_ton}, ${collection_id}, NOW(), ${active})
      RETURNING id
    `;
  
    return result[0].id;
  }
  
  export { NftMinted, insertNftMinted };