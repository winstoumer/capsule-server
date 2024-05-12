// balance.controller.ts

import { Request, Response } from 'express';
import { getBalanceByTelegramId } from './balance.model';

// Обработчик для получения баланса по telegram_id
async function getBalance(req: Request, res: Response): Promise<void> {
  const { telegramId } = req.params;
  try {
    const balance = await getBalanceByTelegramId(Number(telegramId));
    if (balance) {
      res.json(balance);
    } else {
      res.status(404).json({ message: 'Баланс не найден' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}

export { getBalance };
