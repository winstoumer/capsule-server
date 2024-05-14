import { Request, Response } from 'express';
import { getAllActiveMatter, updateUserMatterByTelegramId } from './matter.model';

async function getAllActiveMatterHandler(req: Request, res: Response): Promise<void> {
  try {
    const activeMatter = await getAllActiveMatter();
    res.json(activeMatter);
  } catch (error) {
    console.error('Ошибка при получении списка активных элементов:', error);
    res.status(500).json({ message: 'Произошла ошибка при получении списка активных элементов' });
  }
}

async function updateUserMatterHandler(req: Request, res: Response): Promise<void> {
  const { telegram_id, matter_id } = req.body;
  if (telegram_id === undefined || matter_id === undefined) {
    res.status(400).json({ message: 'Необходимо указать telegram_id и matter_id' });
    return;
  }

  try {
    await updateUserMatterByTelegramId(telegram_id, matter_id);
    res.json({ message: 'Запись в таблице user_matter успешно обновлена' });
  } catch (error) {
    console.error('Ошибка при обновлении записи в таблице user_matter:', error);
    res.status(500).json({ message: 'Произошла ошибка при обновлении записи в таблице user_matter' });
  }
}

export { getAllActiveMatterHandler, updateUserMatterHandler };
