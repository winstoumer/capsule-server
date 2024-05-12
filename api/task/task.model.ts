// task.model.ts

import { sql } from '../database';

interface Task {
  id: number;
  task_id: number;
  name: string;
  reward: number;
  time: Date;
  active: boolean;
}

async function getAllTasksByTelegramId(telegramId: number): Promise<Task[]> {
  try {
    const tasks = await sql<Task[]>`
      SELECT *
      FROM task
      WHERE active = true
      ORDER BY
        CASE WHEN EXISTS (
          SELECT 1
          FROM completed_task
          WHERE completed_task.task_id = task.task_id
            AND completed_task.telegram_id = ${telegramId}
        ) THEN 1 ELSE 0 END,
        time;
    `;
    return tasks;
  } catch (error) {
    console.error('Ошибка при получении списка заданий для пользователя:', error);
    return [];
  }
}

export { Task, getAllTasksByTelegramId };
