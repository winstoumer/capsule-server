// matter.controller.ts

import { Request, Response } from 'express';
import { getAllActiveMatter } from './matter.model';

async function getAllActiveMatterHandler(req: Request, res: Response): Promise<void> {
  try {
    const activeMatter = await getAllActiveMatter();
    res.json(activeMatter);
  } catch (error) {
    console.error('Ошибка при получении списка активных элементов:', error);
    res.status(500).json({ message: 'Произошла ошибка при получении списка активных элементов' });
  }
}

export { getAllActiveMatterHandler };
