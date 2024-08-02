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
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Обработчик для маршрута вебхука
app.post(`/webhook/${process.env.WEBHOOK_SECRET_PATH}`, (req, res) => {
    const { body } = req;
    bot.processUpdate(body);
    res.sendStatus(200);
});

// ID канала (можно получить из настроек канала или от BotFather)
const channelId = '-1002165541344';

// Условие для отправки сообщения при запуске
const sendMessageOnStart = true;

// Функция для отправки и закрепления сообщения в канале
const sendMessageToChannel = async () => {
    const opts = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Play',
                        url: 'https://t.me/bigmatter_bot/app'
                    }
                ]
            ]
        }
    };

    const message = await bot.sendMessage(channelId, 'Bigmatter here:', opts);
    await bot.pinChatMessage(channelId, message.message_id);
};

// Проверка условия и отправка сообщения при запуске бота
if (sendMessageOnStart) {
    sendMessageToChannel();
}

// Хранение идентификаторов пользователей
const userIds: Set<number> = new Set<number>();

// Определите расписание времени открытия и закрытия портала
const portalIntervals = [
    { open: { hour: 2, minute: 10 }, close: { hour: 2, minute: 40 } },
    { open: { hour: 6, minute: 10 }, close: { hour: 6, minute: 40 } },
    { open: { hour: 9, minute: 10 }, close: { hour: 9, minute: 40 } },
    { open: { hour: 12, minute: 10 }, close: { hour: 12, minute: 40 } },
    { open: { hour: 16, minute: 10 }, close: { hour: 16, minute: 40 } },
    { open: { hour: 18, minute: 10 }, close: { hour: 18, minute: 40 } },
    { open: { hour: 19, minute: 10 }, close: { hour: 19, minute: 40 } },
    { open: { hour: 21, minute: 30 }, close: { hour: 22, minute: 10 } },
    { open: { hour: 23, minute: 10 }, close: { hour: 23, minute: 40 } }
];

// Функция для отправки сообщения всем пользователям из базы данных
const notifyUsers = async (message: string) => {
    try {
        // Получаем все активные идентификаторы пользователей из базы данных
        const users = await sql`SELECT telegram_id FROM users WHERE active = true`;
        
        // Отправляем сообщение каждому пользователю
        for (const user of users) {
            const { telegram_id } = user;
            try {
                await bot.sendMessage(telegram_id, message, {
                    reply_markup: {
                        inline_keyboard: [[{ text: 'Open', url: 'https://t.me/bigmatter_bot/app' }]]
                    }
                });
            } catch (error) {
                // Логгируем ошибку и продолжаем отправку другим пользователям
                console.error(`Failed to send message to user ${telegram_id}:`, error);
                continue; // Пропускаем текущего пользователя и продолжаем со следующим
            }
        }
    } catch (error) {
        console.error('Error in notifyUsers:', error);
    }
};

async function createUserAndSaveData(telegramId: number, firstName: string, referralId?: string): Promise<boolean> {
    const userId = uuidv4();
    const currentTime = new Date();
    const sixHoursInMilliseconds = 6 * 60 * 60 * 1000;
    const nextTime = new Date(currentTime.getTime() + sixHoursInMilliseconds);
    const initialBalance = referralId ? 550.00 : 50.00;

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
                INSERT INTO current_mining (user_id, telegram_id, time, next_time, matter_id, nft_mined, mint_active)
                VALUES (${userId}, ${telegramId}, ${currentTime}, ${nextTime}, 1, false, false)
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
        console.error('Error in createUserAndSaveData:', error);
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
                await bot.sendMessage(chatId, `Hi, ${firstName}!`, {
                    reply_markup: {
                        inline_keyboard: [[{ text: 'Open', url: 'https://t.me/bigmatter_bot/app' }]]
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
        console.error('Error in /start handler:', error);
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

        // Планируем задачу для уведомления об открытии портала
        schedule.scheduleJob({ hour: open.hour, minute: open.minute, second: 0 }, () => {
            notifyUsers(`The portal is now open for ${durationMessage} 🛸`);
        });

        // Планируем задачу для уведомления о закрытии портала
        schedule.scheduleJob({ hour: close.hour, minute: close.minute, second: 0 }, () => {
            notifyUsers(`I'll be back soon 👽`);
        });
    });
};

schedulePortalNotifications();

export { botRouter };