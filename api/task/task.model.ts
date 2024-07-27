// task.model.ts

import { sql } from '../database';

interface Task {
  id: number;
  task_id: number;
  name: string;
  reward: number;
  time: Date;
  active: boolean;
  link: string;
  icon: string;
  required_progress: number;
  // not in the database
  ready: boolean;
}

interface User {
  id: number;
  user_id: string;
  telegram_id: number;
}

interface CompletedTask {
  id: number;
  user_id: string;
  telegram_id: number;
  task_id: number;
  time: Date;
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

async function completeTask(telegramId: number, taskId: number): Promise<void> {
  try {
    // Проверяем, существует ли запись о выполненном задании с task_id для данного telegram_id
    const existingCompletedTask = await sql<CompletedTask[]>`
      SELECT * FROM completed_task WHERE telegram_id = ${telegramId} AND task_id = ${taskId};
    `;

    if (existingCompletedTask.length === 0) {
      // Если запись не существует, добавляем новую запись
      const user = await sql<User[]>`
        SELECT user_id FROM users WHERE telegram_id = ${telegramId};
      `;

      if (user.length === 0) {
        throw new Error(`Пользователь с telegram_id ${telegramId} не найден.`);
      }

      const userId = user[0].user_id; // Здесь userId уже является значением UUID

      await sql`
        INSERT INTO completed_task (user_id, telegram_id, task_id, time)
        VALUES (${userId}, ${telegramId}, ${taskId}, NOW());
      `;
    }
  } catch (error) {
    console.error('Ошибка при добавлении выполненного задания:', error);
    throw error;
  }
}

export { Task, getAllTasksByTelegramId, completeTask};