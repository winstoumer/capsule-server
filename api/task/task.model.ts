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
  is_completed?: boolean;
  is_reward_claimed?: boolean;
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
  is_completed?: boolean;
  is_reward_claimed?: boolean;
}

async function getAllTasksByTelegramId(telegramId: number): Promise<Task[]> {
  try {
    const tasks = await sql<Task[]>`
      SELECT task.*, 
             CASE WHEN completed_task.is_completed = TRUE THEN TRUE ELSE FALSE END AS is_completed,
             CASE WHEN completed_task.is_reward_claimed = TRUE THEN TRUE ELSE FALSE END AS is_reward_claimed
      FROM task
      LEFT JOIN completed_task 
        ON task.task_id = completed_task.task_id 
        AND completed_task.telegram_id = ${telegramId}
      WHERE task.active = TRUE
      ORDER BY is_completed, task.time;
    `;
    return tasks;
  } catch (error) {
    console.error('Ошибка при получении списка заданий для пользователя:', error);
    return [];
  }
}

async function completeTask(telegramId: number, taskId: number): Promise<void> {
  try {
    const existingCompletedTask = await sql<CompletedTask[]>`
      SELECT * FROM completed_task 
      WHERE telegram_id = ${telegramId} AND task_id = ${taskId};
    `;

    if (existingCompletedTask.length === 0) {
      const user = await sql<User[]>`
        SELECT user_id FROM users WHERE telegram_id = ${telegramId};
      `;

      if (user.length === 0) {
        throw new Error(`Пользователь с telegram_id ${telegramId} не найден.`);
      }

      const userId = user[0].user_id;

      await sql`
        INSERT INTO completed_task (user_id, telegram_id, task_id, time, is_completed)
        VALUES (${userId}, ${telegramId}, ${taskId}, NOW(), TRUE);
      `;
    } else if (!existingCompletedTask[0].is_completed) {
      await sql`
        UPDATE completed_task
        SET is_completed = TRUE, time = NOW()
        WHERE id = ${existingCompletedTask[0].id};
      `;
    }
  } catch (error) {
    console.error('Ошибка при добавлении выполненного задания:', error);
    throw error;
  }
}

async function claimReward(telegramId: number, taskId: number): Promise<void> {
  try {
    const existingCompletedTask = await sql<CompletedTask[]>`
      SELECT * FROM completed_task 
      WHERE telegram_id = ${telegramId} AND task_id = ${taskId} AND is_completed = TRUE;
    `;

    if (existingCompletedTask.length === 0 || existingCompletedTask[0].is_reward_claimed) {
      throw new Error('Задание не выполнено или награда уже получена.');
    }

    await sql`
      UPDATE completed_task
      SET is_reward_claimed = TRUE
      WHERE id = ${existingCompletedTask[0].id};
    `;

    const task = await sql<Task[]>`
      SELECT reward FROM task WHERE task_id = ${taskId};
    `;

    const reward = task[0].reward;
    const time_update = new Date();

    await sql`
      UPDATE balance
      SET balance = balance + ${reward}, time_update = ${time_update}
      WHERE telegram_id = ${telegramId}
    `;

  } catch (error) {
    console.error('Ошибка при получении награды:', error);
    throw error;
  }
}

export { Task, getAllTasksByTelegramId, completeTask, claimReward };
