// balance.router.ts

import { Router } from 'express';
import { getBalance } from './balance.controller';

const router = Router();

router.get('/:telegramId', getBalance);

export default router;
