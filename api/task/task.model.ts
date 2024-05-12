// task.model.ts

import { sql } from '../database';

interface Task {
  id: number;
  task_id: number;
  name: string;
  reward: number;
  time: Date;
  active: boolean;
  // not in the database
  ready: boolean;
}

async function getAllTasksByTelegramId(telegramId: number): Promise<Task[]> {
  try {
    const tasks = await sql<Task[]>`
      SELECT task.*, CASE WHEN completed_task.task_id IS NOT NULL THEN true ELSE false END AS ready
      FROM task
      LEFT JOIN completed_task ON task.task_id = completed_task.task_id AND completed_task.telegram_id = ${telegramId}
      WHERE task.active = true
      ORDER BY ready, task.time;
    `;
    return tasks;
  } catch (error) {
    console.error('Ошибка при получении списка заданий для пользователя:', error);
    return [];
  }
}

export { Task, getAllTasksByTelegramId };