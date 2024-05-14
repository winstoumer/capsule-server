import * as dotenv from 'dotenv';
import * as cors from 'cors';
import * as ntpClient from 'ntp-client';

import { botRouter } from './api/bot';
import { balanceRouter } from './api/balance';
import { referralRouter } from './api/referral';
import { userRouter } from './api/user';
import { taskRouter } from './api/task';
import { matterRouter } from './api/matter';
import { currentMiningRouter } from './api/currentMining';

dotenv.config();

import * as express from 'express';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/bot', botRouter);
app.use('/api/balance', balanceRouter);
app.use('/api/referral', referralRouter);
app.use('/api/user', userRouter);
app.use('/api/task', taskRouter);
app.use('/api/matter', matterRouter);
app.use('/api/currentMining', currentMiningRouter);

app.get('/api/currentTime', async (req, res) => {
    try {
        const currentTime = await getCurrentTimeFromNTP(); // Получаем текущее время с NTP-сервера
        res.json({ currentTime });
    } catch (error) {
        console.error('Ошибка получения времени с NTP-сервера:', error);
        res.status(500).json({ error: 'Ошибка получения времени с NTP-сервера' });
    }
});

const getCurrentTimeFromNTP = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        ntpClient.getNetworkTime("pool.ntp.org", 123, (err: string | Error | null, date: Date | null) => {
            if (err || !date) {
                reject(err || new Error('Не удалось получить время с NTP-сервера'));
            } else {
                const formattedTime = formatDateUTC(date);
                resolve(formattedTime);
            }
        });
    });
};

const formatDateUTC = (time: Date): string => {
    const year = time.getUTCFullYear();
    const month = (time.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = time.getUTCDate().toString().padStart(2, '0');
    const hours = time.getUTCHours().toString().padStart(2, '0');
    const minutes = time.getUTCMinutes().toString().padStart(2, '0');
    const seconds = time.getUTCSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});