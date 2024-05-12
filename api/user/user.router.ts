// user.router.ts

import { Router } from 'express';
import { getUserByTelegramIdHandler, updateUserFirstNameHandler, getUserByTelegramIdWithInfoHandler } from './user.controller';

const userRouter = Router();

userRouter.get('/:telegramId', getUserByTelegramIdHandler);
userRouter.get('/info/:telegramId', getUserByTelegramIdWithInfoHandler);
userRouter.put('/:telegramId', updateUserFirstNameHandler);

export { userRouter };