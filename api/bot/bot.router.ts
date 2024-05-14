// user.router.ts

import { Router } from 'express';
const TelegramBot = require('node-telegram-bot-api');

const botRouter = Router();

botRouter.post('/sendReferralMessage', async (req: any, res: any) => {
    const { telegramUserId } = req.body;

    try {
        const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
        await bot.sendMessage(telegramUserId, `Ваш реферальный код:  https://t.me/gbaswebtest_bot?start=${telegramUserId}`);
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка отправки сообщения');
    }
});

export { botRouter };