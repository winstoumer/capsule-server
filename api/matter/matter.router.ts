// matter.router.ts

import { Router } from 'express';
import { getAllActiveMatterHandler, updateUserMatterHandler } from './matter.controller';

const matterRouter = Router();

matterRouter.get('/', getAllActiveMatterHandler);
matterRouter.put('/upgrade/:telegram_id', updateUserMatterHandler);

export { matterRouter };