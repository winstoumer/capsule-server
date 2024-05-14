// balance.router.ts

import { Router } from 'express';
import { getBalance, updateBalance } from './balance.controller';

const router = Router();

// Маршрут для получения баланса по telegram_id
router.get('/:telegramId', getBalance);

// Маршрут для обновления баланса по telegram_id
router.put('/:telegramId', updateBalance);

export { router };