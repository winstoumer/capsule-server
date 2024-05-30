// currentMining.controller.ts

import { Request, Response } from 'express';
import { getCurrentMiningByTelegramId, updateCurrentMiningByTelegramId, nftMinted } from './currentMining.model';
import { AES, enc } from 'crypto-js';

const secretKey = process.env.SECRET_KEY;

if (!secretKey) {
    throw new Error('SECRET_KEY is not defined in the environment variables');
}

async function getCurrentMiningByTelegramIdHandler(req: Request, res: Response): Promise<void> {
    const encryptedTelegramId = req.query.data as string;
    try {
        if (!encryptedTelegramId) {
            res.status(400).json({ message: 'No encrypted data provided' });
            return;
        }

        if (!secretKey) {
            res.status(500).json({ message: 'Secret key is not defined' });
            return;
        }

        const bytes = AES.decrypt(encryptedTelegramId, secretKey);
        const telegramId = bytes.toString(enc.Utf8);

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
    const { telegramId } = req.params;
    const { matter_id, nft_mined, time_end_mined_nft, mint_active } = req.body;

    try {
        await updateCurrentMiningByTelegramId(parseInt(telegramId, 10), Number(matter_id), nft_mined, time_end_mined_nft, mint_active);
        res.json({ message: 'Данные о текущем майнинге успешно обновлены' });
    } catch (error) {
        console.error('Ошибка при обновлении данных о текущем майнинге:', error);
        res.status(500).json({ message: 'Произошла ошибка при обновлении данных о текущем майнинге' });
    }
}

async function nftMintedHandler(req: Request, res: Response): Promise<void> {
    const { telegramId } = req.params;

    try {
        await nftMinted(parseInt(telegramId, 10));
        res.json({ message: 'Данные о текущем майнинге успешно обновлены' });
    } catch (error) {
        console.error('Ошибка при обновлении данных о текущем майнинге:', error);
        res.status(500).json({ message: 'Произошла ошибка при обновлении данных о текущем майнинге' });
    }
}

export { getCurrentMiningByTelegramIdHandler, updateCurrentMiningByTelegramIdHandler, nftMintedHandler };
