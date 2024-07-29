import { Router } from 'express';
import { getAllTasksByTelegramIdHandler, completeTaskHandler, claimRewardHandler } from './task.controller';

const taskRouter = Router();

taskRouter.get('/:telegramId', getAllTasksByTelegramIdHandler);
taskRouter.post('/:telegramId/:taskId/complete', completeTaskHandler);
taskRouter.post('/:telegramId/:taskId/claim', claimRewardHandler);

export { taskRouter };
