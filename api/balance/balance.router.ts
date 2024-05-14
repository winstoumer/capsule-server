// balance.router.ts

import { Router } from 'express';
import { getBalance, updateBalance } from './balance.controller';

const balanceRouter = Router();

// Маршрут для получения баланса по telegram_id
balanceRouter.get('/:telegramId', getBalance);

// Маршрут для обновления баланса по telegram_id
balanceRouter.put('/:telegramId', updateBalance);

export { balanceRouter };