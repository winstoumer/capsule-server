// matter.router.ts

import { Router } from 'express';
import { getAllActiveMatterHandler } from './matter.controller';

const matterRouter = Router();

matterRouter.get('/', getAllActiveMatterHandler);

export { matterRouter };