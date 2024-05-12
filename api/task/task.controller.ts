// task.controller.ts

import { Request, Response } from 'express';
import { getAllTasksByTelegramId } from './task.model';

async function getAllTasksByTelegramIdHandler(req: Request, res: Response): Promise<void> {
  const { telegramId } = req.params;
  try {
    const tasks = await getAllTasksByTelegramId(parseInt(telegramId, 10));
    res.json(tasks);
  } catch (error) {
    console.error('Ошибка при получении списка заданий для пользователя:', error);
    res.status(500).json({ message: 'Произошла ошибка при получении списка заданий для пользователя' });
  }
}

export { getAllTasksByTelegramIdHandler };
