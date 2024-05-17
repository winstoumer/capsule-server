// bot.router.ts

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { sql } from '../database';
const TelegramBot = require('node-telegram-bot-api');

const botRouter = Router();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

async function createUserAndSaveData(telegramId: number, firstName: string, referralId?: string): Promise<boolean> {
    const userId = uuidv4();
    const currentTime = new Date();
    const nextTime = new Date(currentTime.getTime() + 1 * 60 * 60 * 1000);

    try {
        await sql.begin(async sql => {
            // Вставляем данные в таблицу users
            await sql`
                INSERT INTO users (user_id, telegram_id, first_name, time, time_update, active)
                VALUES (${userId}, ${telegramId}, ${firstName}, ${currentTime}, ${currentTime}, true)
            `;

            // Вставляем данные в таблицу balance
            await sql`
                INSERT INTO balance (user_id, telegram_id, balance, time, time_update, active)
                VALUES (${userId}, ${telegramId}, 150.00, ${currentTime}, ${currentTime}, true)
            `;

            // Вставляем данные в таблицу user_matter
            await sql`
                INSERT INTO user_matter (user_id, telegram_id, matter_id, time, time_update, active)
                VALUES (${userId}, ${telegramId}, 1, ${currentTime}, ${currentTime}, true)
            `;

            // Вставляем данные в таблицу current_mining
            await sql`
                INSERT INTO current_mining (user_id, telegram_id, time, next_time, matter_id)
                VALUES (${userId}, ${telegramId}, ${currentTime}, ${nextTime}, 1)
            `;

            // Если есть referralId, вставляем данные в таблицу referral
            if (referralId) {
                await sql`
                    INSERT INTO referral (invited_id, invited_by_id, invited_telegram_id, invited_by_telegram_id, time, active)
                    VALUES (${userId}, null, ${telegramId}, ${referralId}, ${currentTime}, true)
                `;
            }
        });
        return true;
    } catch (error) {
        console.error('Ошибка при создании пользователя:', error);
        return false;
    }
}

bot.onText(/\/start(?:\s+r_(\d+))?/, async (msg: any, match: any) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const firstName = msg.from.first_name;
    const referralId = match[1]; // Если есть реферальный ID

    try {
        const userExists = await sql`
            SELECT 1 FROM users WHERE telegram_id = ${telegramId}
        `;
        if (userExists.length === 0) {
            const userCreated = await createUserAndSaveData(telegramId, firstName, referralId);
            if (userCreated) {
                await bot.sendMessage(chatId, `Добро пожаловать, ${firstName}! Ваш аккаунт успешно создан.`);
            } else {
                await bot.sendMessage(chatId, `Произошла ошибка при создании вашего аккаунта. Попробуйте позже.`);
            }
        } else {
            await bot.sendMessage(chatId, `Добро пожаловать обратно, ${firstName}!`);
        }
    } catch (error) {
        console.error('Ошибка при обработке команды /start:', error);
        await bot.sendMessage(chatId, `Произошла ошибка. Попробуйте позже.`);
    }
});

botRouter.post('/sendReferralMessage', async (req: any, res: any) => {
    const { telegramUserId } = req.body;

    try {
        await bot.sendMessage(telegramUserId, `Your referral link: https://t.me/gbaswebtest_bot?start=r_${telegramUserId}`);
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка отправки сообщения');
    }
});

export { botRouter };