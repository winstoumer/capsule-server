import * as dotenv from 'dotenv';
import * as cors from 'cors';

dotenv.config();

import * as express from 'express';
import { balanceRouter } from './api/balance';
import { referralRouter } from './api/referral';
import { userRouter } from './api/user';
import { taskRouter } from './api/task';
import { matterRouter } from './api/matter';
import { currentMiningRouter } from './api/currentMining';

const app = express();

app.use(cors());

app.use('/api/balance', balanceRouter);
app.use('/api/referral', referralRouter);
app.use('/api/user', userRouter);
app.use('/api/task', taskRouter);
app.use('/api/matter', matterRouter);
app.use('/api/currentMining', currentMiningRouter);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});