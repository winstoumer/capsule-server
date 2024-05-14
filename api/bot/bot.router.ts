// user.router.ts

import { Router } from 'express';
const TelegramBot = require('node-telegram-bot-api');

const botRouter = Router();

const token = '7129507448:AAE3uaePuXH_9SmV5KM6TnYbuzJuSsEoB3M';

const bot = new TelegramBot(token, { polling: true });

botRouter.post('/sendReferralMessage', async (req: any, res: any) => {
    const { telegramUserId } = req.body;

    try {
        await bot.sendMessage(telegramUserId, `Ваш реферальный код:  https://t.me/gbaswebtest_bot?start=${telegramUserId}`);
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка отправки сообщения');
    }
});

export { botRouter };