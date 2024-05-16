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

async function updateBalanceByTelegramId(telegramId: number, amount: number): Promise<void> {
  try {
    const time_update = new Date();
    const formattedAmount = -Math.abs(amount);
    await sql`
      UPDATE balance
      SET balance = balance + ${formattedAmount}, time_update = ${time_update}
      WHERE telegram_id = ${telegramId}
    `;
  } catch (error) {
    console.error('Ошибка при обновлении баланса:', error);
    throw error;
  }
}

async function updateBalanceAddCoins(telegram_id: number, amount: number): Promise<void> {
  try {
    const time_update = new Date();
    const formattedAmount = Math.abs(amount);
    await sql`
      UPDATE balance
      SET balance = balance + ${formattedAmount}, time_update = ${time_update}
      WHERE telegram_id = ${telegram_id}
    `;
  } catch (error) {
    console.error('Ошибка при обновлении баланса:', error);
    throw error;
  }
}

export { Balance, getBalanceByTelegramId, updateBalanceByTelegramId, updateBalanceAddCoins };

