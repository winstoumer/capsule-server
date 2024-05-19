// collections.router.ts

import { Router } from 'express';
import { getActiveCollectionsHandler, getCollectionByIdHandler } from './collections.controller';

const collectionsRouter = Router();

collectionsRouter.get('/active', getActiveCollectionsHandler);
collectionsRouter.get('/:id', getCollectionByIdHandler);

export { collectionsRouter };