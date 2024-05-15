// currentMining.router.ts

import { Router } from 'express';
import { getCurrentMiningByTelegramIdHandler, updateCurrentMiningByTelegramIdHandler } from './currentMining.controller';

const currentMiningRouter = Router();

currentMiningRouter.get('/ready/:telegramId/current', getCurrentMiningByTelegramIdHandler);
currentMiningRouter.put('/ready/:telegramId/update', updateCurrentMiningByTelegramIdHandler);

export { currentMiningRouter };
