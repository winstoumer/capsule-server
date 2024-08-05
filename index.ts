import * as dotenv from 'dotenv';
import * as cors from 'cors';
import * as ntpClient from 'ntp-client';
import * as bodyParser from 'body-parser';

dotenv.config();

import { botRouter } from './api/bot';
import { balanceRouter } from './api/balance';
import { referralRouter } from './api/referral';
import { userRouter } from './api/user';
import { taskRouter } from './api/task';
import { matterRouter } from './api/matter';
import { currentMiningRouter } from './api/currentMining';
import { collectionsRouter } from './api/collections';
import { mintRouter } from './api/mint';
import leaderboardRoutes from './api/leaderboard/leaderboard.router';

import * as express from 'express';

const app = express();

const allowedOrigins = ['https://capsule09876.netlify.app'];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin as string) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3002;

app.use('/api/bot', botRouter);
app.use('/api/balance', balanceRouter);
app.use('/api/referral', referralRouter);
app.use('/api/user', userRouter);
app.use('/api/task', taskRouter);
app.use('/api/matter', matterRouter);
app.use('/api/currentMining', currentMiningRouter);
app.use('/api/collections', collectionsRouter);
app.use('/api/mint', mintRouter);
app.use('/api/leaderboard', leaderboardRoutes)

app.get('/api/ton-json/tonconnect-manifest.json', async (req, res) => {
  try {
    const data = await fetchData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error });
  }
});

async function fetchData() {
  return {
    "url": "BigMatter",
    "name": "BigMatter",
    "iconUrl": "https://i.ibb.co/Bj5nV7t/Untitled.png",
    "termsOfUseUrl": "BigMatter",
    "privacyPolicyUrl": "BigMatter"
  };
}

app.get('/api/currentTime', async (req, res) => {
  try {
    const currentTime = await getCurrentTimeFromNTP();
    res.json({ currentTime });
  } catch (error) {
    console.error('Error NTP:', error);
    res.status(500).json({ error: 'Error NTP' });
  }
});

const getCurrentTimeFromNTP = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    ntpClient.getNetworkTime("pool.ntp.org", 123, (err: string | Error | null, date: Date | null) => {
      if (err || !date) {
        reject(err || new Error('Error NTP time'));
      } else {
        const formattedTime = date.toISOString();
        resolve(formattedTime);
      }
    });
  });
};

// Portal
const portalIntervals = [
  { open: { hour: 2, minute: 10 }, close: { hour: 2, minute: 40 } },
  { open: { hour: 6, minute: 10 }, close: { hour: 6, minute: 40 } },
  { open: { hour: 9, minute: 10 }, close: { hour: 9, minute: 40 } },
  { open: { hour: 12, minute: 10 }, close: { hour: 12, minute: 40 } },
  { open: { hour: 12, minute: 50 }, close: { hour: 16, minute: 30 } },
  { open: { hour: 16, minute: 10 }, close: { hour: 17, minute: 40 } },
  { open: { hour: 18, minute: 10 }, close: { hour: 18, minute: 40 } },
  { open: { hour: 19, minute: 10 }, close: { hour: 19, minute: 40 } },
  { open: { hour: 21, minute: 30 }, close: { hour: 23, minute: 10 } },
  { open: { hour: 23, minute: 10 }, close: { hour: 2, minute: 5 } }
];

let isPortalOpen = false;

// Функция для получения текущего времени из NTP
const getCurrentTimeFromNTPPortal = (): Promise<Date> => {
  return new Promise((resolve, reject) => {
    ntpClient.getNetworkTime("pool.ntp.org", 123, (err: string | Error | null, date: Date | null) => {
      if (err || !date) {
        reject(err || new Error('Error NTP time'));
      } else {
        resolve(date);
      }
    });
  });
};

// Функция для проверки, находится ли текущее время в любом из интервалов
const isTimeInAnyRange = (current: Date, intervals: Array<{ open: { hour: number, minute: number }, close: { hour: number, minute: number } }>): boolean => {

  return intervals.some(interval => {
    const startDate = new Date();
    startDate.setUTCHours(interval.open.hour, interval.open.minute, 0, 0);

    const endDate = new Date();
    endDate.setUTCHours(interval.close.hour, interval.close.minute, 0, 0);

    if (startDate < endDate) {
      // Интервал не пересекает полночь
      return (current >= startDate && current <= endDate);
    } else {
      // Интервал пересекает полночь
      return (current >= startDate || current <= endDate);
    }
  });
};

// Функция для изменения состояния портала
const updatePortalState = async () => {
  try {
    const currentTime = await getCurrentTimeFromNTPPortal();

    // Проверка, находится ли текущее время в любом из интервалов открытия портала
    isPortalOpen = isTimeInAnyRange(currentTime, portalIntervals);
  } catch (error) {
    console.error('Error NTP:', error);
    // Обработка ошибки (например, можно оставить текущее состояние без изменений)
  }
};

// Обновляем состояние портала каждые 10 секунд
setInterval(updatePortalState, 10000);

app.get('/api/portal-state', (req, res) => {
  res.json({ isOpen: isPortalOpen });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});