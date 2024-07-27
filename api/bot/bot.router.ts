// bot.router.ts

import { Router } from 'express';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import { sql } from '../database';
const TelegramBot = require('node-telegram-bot-api');
import * as schedule from 'node-schedule';

const botRouter = Router();
const app = express();

app.use(bodyParser.json());

// Инициализация бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

bot.setWebHook(`https://capsule-server.onrender.com/webhook/${process.env.WEBHOOK_SECRET_PATH}`);

// Хранение идентификаторов пользователей
const userIds: Set<number> = new Set<number>();

// Определите расписание времени открытия и закрытия портала
const portalIntervals = [
    { open: { hour: 10, minute: 30 }, close: { hour: 11, minute: 0 } },
    { open: { hour: 11, minute: 0 }, close: { hour: 16, minute: 30 } },
    { open: { hour: 16, minute: 0 }, close: { hour: 16, minute: 30 } },
    { open: { hour: 22, minute: 0 }, close: { hour: 22, minute: 30 } }
];

// Функция для отправки сообщения всем пользователям
const notifyUsers = (message: string) => {
    userIds.forEach(userId => {
        bot.sendMessage(userId, message, {
            reply_markup: {
                inline_keyboard: [[{ text: 'Open', url: 'https://t.me/bigmatter_bot/app' }]]
            }
        }).catch((error: unknown) => {
            if (error instanceof Error) {
                console.error(`Failed to send message to user ${userId}: ${error.message}`);
            } else {
                console.error(`Failed to send message to user ${userId}: ${error}`);
            }
        });
    });
};

async function createUserAndSaveData(telegramId: number, firstName: string, referralId?: string): Promise<boolean> {
    const userId = uuidv4(); // Генерация уникального UUID
    const currentTime = new Date();
    const nextTime = new Date(currentTime.getTime() + 1 * 60 * 60 * 1000); // Через 1 час
    const initialBalance = referralId ? 550.00 : 50.00;

    try {
        await sql.begin(async sql => {
            // Вставляем данные в таблицу users, обновляем, если запись уже существует
            await sql`
                INSERT INTO users (user_id, telegram_id, first_name, time, time_update, active)
                VALUES (${userId}, ${telegramId}, ${firstName}, ${currentTime}, ${currentTime}, true)
                ON CONFLICT (telegram_id) DO UPDATE
                SET first_name = EXCLUDED.first_name, time = ${currentTime}, time_update = ${currentTime}
                WHERE users.telegram_id = ${telegramId}
            `;

            // Вставляем данные в таблицу balance
            await sql`
                INSERT INTO balance (user_id, telegram_id, balance, time, time_update, active)
                VALUES (${userId}, ${telegramId}, ${initialBalance}, ${currentTime}, ${currentTime}, true)
                ON CONFLICT (user_id) DO UPDATE
                SET balance = EXCLUDED.balance, time_update = ${currentTime}
            `;

            // Вставляем данные в таблицу user_matter
            await sql`
                INSERT INTO user_matter (user_id, telegram_id, matter_id, time, time_update, active)
                VALUES (${userId}, ${telegramId}, 1, ${currentTime}, ${currentTime}, true)
                ON CONFLICT (user_id) DO UPDATE
                SET matter_id = EXCLUDED.matter_id, time_update = ${currentTime}
            `;

            // Вставляем данные в таблицу current_mining
            await sql`
                INSERT INTO current_mining (user_id, telegram_id, time, next_time, matter_id)
                VALUES (${userId}, ${telegramId}, ${currentTime}, ${nextTime}, 1)
                ON CONFLICT (user_id) DO UPDATE
                SET next_time = EXCLUDED.next_time
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
                    SET balance = balance + 500.00, time_update = ${currentTime}
                    WHERE telegram_id = ${referralId}
                `;
            }
        });
        return true;
    } catch (error) {
        console.error(`Error in createUserAndSaveData for telegramId ${telegramId}:`, error);
        return false;
    }
}

bot.onText(/\/start(?:\s+r_(\d+))?/, async (msg: any, match: any) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const firstName = msg.from.first_name;
    const referralId = match[1];
    userIds.add(chatId);

    console.log(`Received /start command from user ${telegramId}, referralId: ${referralId}`);

    try {
        const userExists = await sql`
            SELECT 1 FROM users WHERE telegram_id = ${telegramId}
        `;
        console.log(`User exists check for ${telegramId}:`, userExists.length);

        if (userExists.length === 0) {
            console.log(`User with telegram_id ${telegramId} does not exist. Creating new user...`);
            const userCreated = await createUserAndSaveData(telegramId, firstName, referralId);
            console.log(`User created status for ${telegramId}:`, userCreated);

            if (userCreated) {
                try {
                    await bot.sendMessage(chatId, `Hi, ${firstName}!`, {
                        reply_markup: {
                            inline_keyboard: [[{ text: 'Open', url: 'https://t.me/bigmatter_bot/app' }]]
                        }
                    });
                } catch (sendMessageError) {
                    console.error(`Failed to send welcome message to ${chatId}:`, sendMessageError);
                    try {
                        await bot.sendMessage(chatId, `An error occurred while sending your welcome message. Please try again later.`);
                    } catch (finalError) {
                        console.error(`Failed to send error message to ${chatId}:`, finalError);
                    }
                }
            } else {
                try {
                    await bot.sendMessage(chatId, `An error occurred while creating your account. Please try again later.`);
                } catch (sendMessageError) {
                    console.error(`Failed to send account creation error message to ${chatId}:`, sendMessageError);
                }
            }
        } else {
            try {
                await bot.sendMessage(chatId, `Hi, ${firstName}!`, {
                    reply_markup: {
                        inline_keyboard: [[{ text: 'Open', url: 'https://t.me/bigmatter_bot/app' }]]
                    }
                });
            } catch (sendMessageError) {
                console.error(`Failed to send message to ${chatId}:`, sendMessageError);
                try {
                    await bot.sendMessage(chatId, `An error occurred while sending your message. Please try again later.`);
                } catch (finalError) {
                    console.error(`Failed to send error message to ${chatId}:`, finalError);
                }
            }
        }
    } catch (error) {
        console.error('Error in /start handler:', error);
        try {
            await bot.sendMessage(chatId, `An error occurred while processing your request. Please try again later.`);
        } catch (sendMessageError) {
            console.error(`Failed to send error message to ${chatId}:`, sendMessageError);
        }
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

// Функция для планирования уведомлений
const schedulePortalNotifications = () => {
    portalIntervals.forEach(interval => {
        const { open, close } = interval;

        // Вычисляем общее количество минут, в течение которых портал открыт
        const totalMinutesOpen = (close.hour * 60 + close.minute) - (open.hour * 60 + open.minute);
        const hours = Math.floor(totalMinutesOpen / 60);
        const minutes = totalMinutesOpen % 60;

        // Формируем строку с продолжительностью работы портала
        let durationMessage = '';
        if (hours > 0) {
            durationMessage += `${hours} hour${hours > 1 ? 's' : ''}`;
        }
        if (minutes > 0) {
            if (hours > 0) durationMessage += ' and ';
            durationMessage += `${minutes} minute${minutes > 1 ? 's' : ''}`;
        }

        schedule.scheduleJob({ hour: open.hour, minute: open.minute, second: 0 }, () => {
            notifyUsers(`The portal is now OPEN for ${durationMessage}.`);
        });

        schedule.scheduleJob({ hour: close.hour, minute: close.minute, second: 0 }, () => {
            notifyUsers('The portal is now CLOSED.');
        });
    });
};

// Запуск функции планирования уведомлений
schedulePortalNotifications();

export { botRouter };