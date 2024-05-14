// user.router.ts

import { Router } from 'express';
const TelegramBot = require('node-telegram-bot-api');

const botRouter = Router();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

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