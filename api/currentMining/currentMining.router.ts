// currentMining.router.ts

import { Router } from 'express';
import { getCurrentMiningByTelegramIdHandler, updateCurrentMiningByTelegramIdHandler } from './currentMining.controller';

const currentMiningRouter = Router();

currentMiningRouter.get('/ready/:telegramId', getCurrentMiningByTelegramIdHandler);
currentMiningRouter.put('/ready/:telegramId', updateCurrentMiningByTelegramIdHandler);

export { currentMiningRouter };
