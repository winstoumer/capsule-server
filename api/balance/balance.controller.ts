// balance.controller.ts

import { Request, Response } from 'express';
import { getBalanceByTelegramId, updateBalanceByTelegramId, updateBalanceAddCoins } from './balance.model';
import { AES, enc } from 'crypto-js';

const secretKey = process.env.SECRET_KEY;

if (!secretKey) {
  throw new Error('SECRET_KEY is not defined in the environment variables');
}

// Обработчик для получения баланса по telegram_id
async function getBalance(req: Request, res: Response): Promise<void> {
  const { telegramId } = req.params;
  try {
    if (!telegramId) {
      res.status(400).json({ message: 'No encrypted data provided' });
      return;
    }

    if (!secretKey) {
      res.status(500).json({ message: 'Secret key is not defined' });
      return;
    }

    const bytes = AES.decrypt(telegramId, secretKey);
    const decryptedTelegramId = bytes.toString(enc.Utf8);

    const balance = await getBalanceByTelegramId(Number(decryptedTelegramId));
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
    await updateBalanceByTelegramId(parseInt(telegramId, 10), Number(amount));
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
