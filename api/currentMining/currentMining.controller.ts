// currentMining.controller.ts

import { Request, Response } from 'express';
import { getCurrentMiningByTelegramId, updateCurrentMiningByTelegramId } from './currentMining.model';

async function getCurrentMiningByTelegramIdHandler(req: Request, res: Response): Promise<void> {
    const { telegramId } = req.params;
    try {
        const miningData = await getCurrentMiningByTelegramId(parseInt(telegramId, 10));
        if (miningData) {
            res.json(miningData);
        } else {
            res.status(404).json({ message: 'Данные о текущем майнинге не найдены' });
        }
    } catch (error) {
        console.error('Ошибка при получении данных о текущем майнинге:', error);
        res.status(500).json({ message: 'Произошла ошибка при получении данных о текущем майнинге' });
    }
}

async function updateCurrentMiningByTelegramIdHandler(req: Request, res: Response): Promise<void> {
    const { telegram_id } = req.params;
    const matter_id = parseInt(req.body.matter_id, 10);
    try {
        const success = await updateCurrentMiningByTelegramId(parseInt(telegram_id, 10), matter_id);
        if (success) {
            res.json({ message: 'Данные о текущем майнинге успешно обновлены' });
        } else {
            res.status(404).json({ message: 'Текущий майнинг не найден' });
        }
    } catch (error) {
        console.error('Ошибка при обновлении данных о текущем майнинге:', error);
        res.status(500).json({ message: 'Произошла ошибка при обновлении данных о текущем майнинге' });
    }
}

export { getCurrentMiningByTelegramIdHandler, updateCurrentMiningByTelegramIdHandler };
