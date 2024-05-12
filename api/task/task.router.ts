// task.router.ts

import { Router } from 'express';
import { getAllTasksByTelegramIdHandler } from './task.controller';

const taskRouter = Router();

taskRouter.get('/:telegramId', getAllTasksByTelegramIdHandler);

export { taskRouter };
