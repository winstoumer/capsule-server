// balance.controller.ts

import { Request, Response } from 'express';
import { getBalanceByTelegramId, updateBalanceByTelegramId, updateBalanceAddCoins } from './balance.model';

// Обработчик для получения баланса по telegram_id
async function getBalance(req: Request, res: Response): Promise<void> {
  const { telegramId } = req.params;
  try {
    const balance = await getBalanceByTelegramId(Number(telegramId));
    if (balance !== null) {
      res.json({ balance });
    } else {
      res.status(404).json({ message: 'Баланс не найден' });
    }
  } catch (error) {
    console.error('Ошибка при получении баланса:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}

// Обработчик для обновления баланса по telegram_id
async function updateBalance(req: Request, res: Response): Promise<void> {
  const { telegramId } = req.params;
  const { amount } = req.body;
  if (typeof amount !== 'number') {
    res.status(400).json({ message: 'Неверный формат суммы' });
    return;
  }

  try {
    await updateBalanceByTelegramId(Number(telegramId), amount);
    res.json({ message: 'Баланс успешно обновлен.' });
  } catch (error) {
    console.error('Ошибка при обновлении баланса:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}

// Обработчик для обновления баланса добавляя coins по telegram_id
async function updateBalanceCoins(req: Request, res: Response): Promise<void> {
  const { telegramId } = req.params;
  const { amount } = req.body;
  if (typeof amount !== 'number') {
    res.status(400).json({ message: 'Неверный формат суммы' });
    return;
  }

  try {
    await updateBalanceAddCoins(parseInt(telegramId, 10), Number(amount));
    res.json({ message: 'Баланс успешно обновлен.' });
  } catch (error) {
    console.error('Ошибка при обновлении баланса:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}

export { getBalance, updateBalance, updateBalanceCoins };
