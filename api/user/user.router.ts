// user.router.ts

import { Router } from 'express';
import { getUserByTelegramIdHandler, updateUserFirstNameHandler, getUserByTelegramIdWithInfoHandler, createUserHandler } from './user.controller';

const userRouter = Router();

userRouter.get('/:telegramId', getUserByTelegramIdHandler);
userRouter.get('/info/:telegramId', getUserByTelegramIdWithInfoHandler);
userRouter.put('/:telegramId', updateUserFirstNameHandler);
userRouter.post('/new/:telegramId', createUserHandler);

export { userRouter };