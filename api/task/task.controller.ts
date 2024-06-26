// task.controller.ts

import { Request, Response } from 'express';
import { getAllTasksByTelegramId, completeTask } from './task.model';

async function getAllTasksByTelegramIdHandler(req: Request, res: Response): Promise<void> {
  const { telegramId } = req.params;
  try {
    const tasks = await getAllTasksByTelegramId(parseInt(telegramId, 10));
    const tasksWithReady = tasks.map(task => ({ ...task, ready: !!task.ready }));
    res.json(tasksWithReady);
  } catch (error) {
    console.error('Ошибка при получении списка заданий для пользователя:', error);
    res.status(500).json({ message: 'Произошла ошибка при получении списка заданий для пользователя' });
  }
}

async function completeTaskHandler(req: Request, res: Response): Promise<void> {
  const { telegramId, taskId } = req.params;
  try {
    await completeTask(parseInt(telegramId, 10), parseInt(taskId, 10));
    res.status(200).json({ message: 'Задание успешно отмечено как выполненное.' });
  } catch (error) {
    console.error('Ошибка при отметке задания как выполненного:', error);
    res.status(500).json({ message: 'Произошла ошибка при отметке задания как выполненного.' });
  }
}

export { getAllTasksByTelegramIdHandler, completeTaskHandler };
