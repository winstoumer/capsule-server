// user.controller.ts

import { Request, Response } from 'express';
import { getUserByTelegramId, updateUserFirstName, getUserInfoByTelegramId, createUser } from './user.model';

async function getUserByTelegramIdHandler(req: Request, res: Response): Promise<void> {
  const { telegramId } = req.params;
  try {
    const user = await getUserByTelegramId(parseInt(telegramId, 10));
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Пользователь не найден' });
    }
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    res.status(500).json({ message: 'Произошла ошибка при получении данных пользователя' });
  }
}

async function updateUserFirstNameHandler(req: Request, res: Response): Promise<void> {
  const { telegramId } = req.params;
  const { firstName } = req.body;
  try {
    const success = await updateUserFirstName(parseInt(telegramId, 10), firstName);
    if (success) {
      res.json({ message: 'Имя пользователя успешно обновлено' });
    } else {
      res.status(404).json({ message: 'Пользователь не найден' });
    }
  } catch (error) {
    console.error('Ошибка при обновлении имени пользователя:', error);
    res.status(500).json({ message: 'Произошла ошибка при обновлении имени пользователя' });
  }
}

async function getUserByTelegramIdWithInfoHandler(req: Request, res: Response): Promise<void> {
  const { telegramId } = req.params;
  try {
    const userWithInfo = await getUserInfoByTelegramId(parseInt(telegramId, 10));
    if (userWithInfo) {
      res.json(userWithInfo);
    } else {
      res.status(404).json({ message: 'Пользователь не найден' });
    }
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    res.status(500).json({ message: 'Произошла ошибка при получении данных пользователя' });
  }
}

async function createUserHandler(req: Request, res: Response): Promise<void> {
  const { telegramId } = req.params; // Получение telegramId из параметров маршрута
  const { firstName } = req.body; // Получение firstName из тела запроса

  if (!telegramId || !firstName) {
    res.status(400).json({ message: 'Необходимо указать telegramId и firstName' });
    return;
  }

  try {
    const userExists = await getUserByTelegramId(parseInt(telegramId, 10));
    if (userExists) {
      res.status(400).json({ message: 'Пользователь уже существует' });
      return;
    }

    const userCreated = await createUser(parseInt(telegramId, 10), firstName);

    if (userCreated) {
      res.status(201).json({ message: 'Пользователь успешно создан' });
    } else {
      res.status(500).json({ message: 'Не удалось создать пользователя' });
    }
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
    res.status(500).json({ message: 'Произошла ошибка при создании пользователя' });
  }
}

export { getUserByTelegramIdHandler, updateUserFirstNameHandler, getUserByTelegramIdWithInfoHandler, createUserHandler };
