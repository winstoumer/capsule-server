// currentMining.controller.ts

import { Request, Response } from 'express';
import { getCurrentMiningByTelegramId, updateCurrentMiningByTelegramId, nftMinted } from './currentMining.model';
import { AES, enc } from 'crypto-js';

interface EncryptedData {
    [key: string]: string;
}

const secretKey = process.env.SECRET_KEY;

if (!secretKey) {
    throw new Error('SECRET_KEY is not defined in the environment variables');
}

async function getCurrentMiningByTelegramIdHandler(req: Request, res: Response): Promise<void> {
    const { data } = req.query;
    try {
        if (!data) {
            res.status(400).json({ message: 'No encrypted data provided' });
            return;
        }

        if (!secretKey) {
            res.status(500).json({ message: 'Secret key is not defined' });
            return;
        }

        const bytes = AES.decrypt(data.toString(), secretKey);
        const telegramId = parseInt(bytes.toString(enc.Utf8), 10);

        const miningData = await getCurrentMiningByTelegramId(telegramId);
        if (miningData) {
            // Encrypt the response data before sending it back
            const encryptedData: EncryptedData = {
                level: AES.encrypt('level', secretKey).toString(),
                image_url: AES.encrypt('image_url', secretKey).toString(),
                next_time: AES.encrypt('next_time', secretKey).toString(),
                coins_mine: AES.encrypt('coins_mine', secretKey).toString(),
                time_mine: AES.encrypt('time_mine', secretKey).toString(),
                matter_id: AES.encrypt('matter_id', secretKey).toString(),
                time_end_mined_nft: AES.encrypt('time_end_mined_nft', secretKey).toString(),
                nft_mined: AES.encrypt('nft_mined', secretKey).toString(),
                mint_active: AES.encrypt('mint_active', secretKey).toString(),
                nft_active: AES.encrypt('nft_active', secretKey).toString()
            };

            for (const key in miningData) {
                if (miningData.hasOwnProperty(key)) {
                    const value = miningData[key];
                    encryptedData[AES.encrypt(key, secretKey).toString()] = AES.encrypt(value.toString(), secretKey).toString();
                }
            }

            res.json(encryptedData);
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
