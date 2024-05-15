// currentMining.router.ts

import { Router } from 'express';
import { getCurrentMiningByTelegramIdHandler, updateCurrentMiningByTelegramIdHandler } from './currentMining.controller';

const currentMiningRouter = Router();

currentMiningRouter.get('/current/:telegramId', getCurrentMiningByTelegramIdHandler);
currentMiningRouter.put('/update/:telegramId', updateCurrentMiningByTelegramIdHandler);

export { currentMiningRouter };
