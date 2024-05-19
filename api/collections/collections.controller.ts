// src/controllers/collections.controller.ts
import { Request, Response } from 'express';
import { getActiveCollections, getCollectionById } from './collections.model';

async function getActiveCollectionsHandler(req: Request, res: Response): Promise<void> {
    try {
      const collections = await getActiveCollections();
      res.json(collections);
    } catch (error) {
      console.error('Ошибка при получении активных коллекций:', error);
      res.status(500).json({ message: 'Произошла ошибка при получении активных коллекций' });
    }
  }

async function getCollectionByIdHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    const collection = await getCollectionById(parseInt(id, 10));
    if (collection) {
      res.json(collection);
    } else {
      res.status(404).json({ message: 'Коллекция не найдена или не активна' });
    }
  } catch (error) {
    console.error('Ошибка при получении коллекции по id:', error);
    res.status(500).json({ message: 'Произошла ошибка при получении коллекции по id' });
  }
}

export { getActiveCollectionsHandler, getCollectionByIdHandler };