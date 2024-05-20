// mint.router.ts
import { Router } from 'express';
import { addNftMinted } from './mint.controller';

const mintRouter = Router();

mintRouter.post('/add', addNftMinted);

export { mintRouter };