// balance.model.ts

import { sql } from '../database';

interface Balance {
  id: number;
  user_id: string;
  telegram_id: number;
  balance: number;
  time: Date;
  time_update: Date;
  active: boolean;
}

async function getBalanceByTelegramId(telegramId: number): Promise<number | null> {
  try {
    const result = await sql<{ balance: number }[]>`
      SELECT balance FROM balance
      WHERE telegram_id = ${telegramId}
    `;
    return result[0]?.balance || null;
  } catch (error) {
    console.error('Ошибка при получении баланса по telegram_id:', error);
    return null;
  }
}

async function updateBalanceByTelegramId(telegramId: number, price: number): Promise<void> {
  try {
    await sql`
      UPDATE balance
      SET balance = balance - ${price}, time_update = NOW()
      WHERE telegram_id = ${telegramId}
    `;
  } catch (error) {
    console.error('Ошибка при обновлении баланса по telegram_id:', error);
    throw error;
  }
}

export { Balance, getBalanceByTelegramId, updateBalanceByTelegramId };

