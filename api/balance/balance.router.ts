// balance.router.ts

import { Router } from 'express';
import { getBalance, updateBalance, updateBalanceCoins } from './balance.controller';

const balanceRouter = Router();

// Маршрут для получения баланса по telegram_id
balanceRouter.get('/', getBalance);

// Маршрут для обновления баланса по telegram_id
balanceRouter.put('/minus/:telegramId', updateBalance);

// Маршрут для обновления баланса по telegram_id
balanceRouter.put('/plus/:telegramId', updateBalanceCoins);

export { balanceRouter };