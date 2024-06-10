// bot.router.ts

import { Router } from 'express';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import { sql } from '../database';
const TelegramBot = require('node-telegram-bot-api');

const botRouter = Router();
const app = express();

app.use(bodyParser.json());

// Инициализация бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Обработчик для маршрута вебхука
app.post(`/webhook/${process.env.WEBHOOK_SECRET_PATH}`, (req, res) => {
    const { body } = req;
    bot.processUpdate(body);
    res.sendStatus(200);
});

async function createUserAndSaveData(telegramId: number, firstName: string, referralId?: string): Promise<boolean> {
    const userId = uuidv4();
    const currentTime = new Date();
    const nextTime = new Date(currentTime.getTime() + 1 * 60 * 60 * 1000);
    const initialBalance = referralId ? 150.00 : 100.00;

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
                VALUES (${userId}, ${telegramId}, ${initialBalance}, ${currentTime}, ${currentTime}, true)
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

                // Обновляем баланс пригласившего пользователя
                await sql`
                    UPDATE balance
                    SET balance = balance + 50.00, time_update = ${currentTime}
                    WHERE telegram_id = ${referralId}
                `;
            }
        });
        return true;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

bot.onText(/\/start(?:\s+r_(\d+))?/, async (msg: any, match: any) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const firstName = msg.from.first_name;
    const referralId = match[1];

    try {
        const userExists = await sql`
            SELECT 1 FROM users WHERE telegram_id = ${telegramId}
        `;
        if (userExists.length === 0) {
            const userCreated = await createUserAndSaveData(telegramId, firstName, referralId);
            if (userCreated) {
                await bot.sendMessage(chatId, `Hi, ${firstName}!`, {
                    reply_markup: {
                        inline_keyboard: [[{ text: 'Open app', url: 'https://t.me/bigmatter_bot/app' }]]
                    }
                });
            } else {
                await bot.sendMessage(chatId, `Try it later`);
            }
        } else {
            await bot.sendMessage(chatId, `Hi, ${firstName}!`, {
                reply_markup: {
                    inline_keyboard: [[{ text: 'Open', url: 'https://t.me/bigmatter_bot/app' }]]
                }
            });
        }
    } catch (error) {
        console.error('Error /start:', error);
        await bot.sendMessage(chatId, `Try it later`);
    }
});

botRouter.post('/sendReferralMessage', async (req: any, res: any) => {
    const { telegramUserId } = req.body;

    try {
        await bot.sendMessage(telegramUserId, `Your referral link: https://t.me/bigmatter_bot?start=r_${telegramUserId}`, {
            reply_markup: {
                inline_keyboard: [[{ text: 'Open', url: 'https://t.me/bigmatter_bot/app' }]]
            }
        });
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
});

export { botRouter };