// currentMining.router.ts

import { Router } from 'express';
import { getCurrentMiningByTelegramIdHandler, updateCurrentMiningByTelegramIdHandler, nftMintedHandler } from './currentMining.controller';

const currentMiningRouter = Router();

currentMiningRouter.get('/current/:telegramId', getCurrentMiningByTelegramIdHandler);
currentMiningRouter.put('/update/:telegramId', updateCurrentMiningByTelegramIdHandler);
currentMiningRouter.put('/minted/:telegramId', nftMintedHandler);

export { currentMiningRouter };
