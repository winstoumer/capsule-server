import * as dotenv from 'dotenv';
import * as postgres from 'postgres'

dotenv.config();

import * as express from 'express';
import { balanceRouter } from './api/balance';
import { referralRouter } from './api/referral';

const app = express();

app.use('/api/balance', balanceRouter);

app.use('/api/referral', referralRouter);

// Запускаем сервер
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});