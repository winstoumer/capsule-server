import * as dotenv from 'dotenv';

dotenv.config();

import * as express from 'express';
import { balanceRouter } from './api/balance';
import { referralRouter } from './api/referral';
import { userRouter } from './api/user';
import { taskRouter } from './api/task';

const app = express();

app.use('/api/balance', balanceRouter);

app.use('/api/referral', referralRouter);

app.use('/api/user', userRouter);

app.use('/api/task', taskRouter);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});