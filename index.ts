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

const PORT = process.env.DATABASE_PORT || 3002;

app.use('/api/bot', botRouter);
app.use('/api/balance', balanceRouter);
app.use('/api/referral', referralRouter);
app.use('/api/user', userRouter);
app.use('/api/task', taskRouter);
app.use('/api/matter', matterRouter);
app.use('/api/currentMining', currentMiningRouter);
app.use('/api/collections', collectionsRouter);
app.use('/api/mint', mintRouter);

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

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});