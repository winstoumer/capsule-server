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
  is_completed?: boolean; // Указывает, что задача выполнена
  is_reward_claimed?: boolean; // Указывает, что награда за выполнение была востребована
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
  is_completed: boolean;
  is_reward_claimed: boolean;
}

async function getAllTasksByTelegramId(telegramId: number): Promise<Task[]> {
  try {
    const tasks = await sql<Task[]>`
      SELECT 
        task.*, 
        CASE WHEN completed_task.task_id IS NOT NULL THEN true ELSE false END AS ready,
        completed_task.is_completed,
        completed_task.is_reward_claimed
      FROM task
      LEFT JOIN completed_task 
        ON task.task_id = completed_task.task_id 
        AND completed_task.telegram_id = ${telegramId}
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
        INSERT INTO completed_task (user_id, telegram_id, task_id, time, is_completed)
        VALUES (${userId}, ${telegramId}, ${taskId}, NOW(), TRUE);
      `;
    } else {
      await sql`
        UPDATE completed_task
        SET is_completed = TRUE
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
    // Получаем запись о выполненном задании
    const [completedTask] = await sql<CompletedTask[]>`
      SELECT * FROM completed_task 
      WHERE telegram_id = ${telegramId} 
        AND task_id = ${taskId} 
        AND is_completed = TRUE
        AND is_reward_claimed = FALSE;
    `;

    if (!completedTask) {
      throw new Error('Задание не выполнено или награда уже получена.');
    }

    // Получаем информацию о задаче
    const [task] = await sql<Task[]>`
      SELECT reward FROM task WHERE task_id = ${taskId};
    `;

    if (!task) {
      throw new Error('Задание не найдено.');
    }

    // Обновляем запись в таблице `completed_task`, указывая, что награда была востребована
    await sql`
      UPDATE completed_task
      SET is_reward_claimed = TRUE
      WHERE id = ${completedTask.id};
    `;

    // Обновляем баланс пользователя
    const rewardAmount = task.reward; // Получаем награду
    const timeUpdate = new Date();
    await sql`
      UPDATE balance
      SET balance = balance + ${rewardAmount}, time_update = ${timeUpdate}
      WHERE telegram_id = ${telegramId}
    `;

  } catch (error) {
    console.error('Ошибка при получении награды:', error);
    throw error;
  }
}

export { Task, getAllTasksByTelegramId, completeTask, claimReward};