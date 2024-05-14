// task.router.ts

import { Router } from 'express';
import { getAllTasksByTelegramIdHandler, completeTaskHandler } from './task.controller';

const taskRouter = Router();

taskRouter.get('/:telegramId', getAllTasksByTelegramIdHandler);
taskRouter.post('/:telegramId/:taskId/complete', completeTaskHandler);

export { taskRouter };