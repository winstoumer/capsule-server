// user.router.ts

import { Router } from 'express';
import { getUserByTelegramIdHandler, updateUserFirstNameHandler } from './user.controller';

const userRouter = Router();

userRouter.get('/:telegramId', getUserByTelegramIdHandler);
userRouter.put('/:telegramId', updateUserFirstNameHandler);

export { userRouter };
