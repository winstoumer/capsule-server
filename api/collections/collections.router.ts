// collections.router.ts

import { Router } from 'express';
import { getCollectionByIdHandler } from './collections.controller';

const collectionsRouter = Router();

collectionsRouter.get('/:id', getCollectionByIdHandler);

export { collectionsRouter };