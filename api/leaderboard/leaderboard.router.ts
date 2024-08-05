// api/leaderboard/leaderboard.routes.ts
import { Router } from 'express';
import { updatePointsController, getLeadersController } from './leaderboard.controller';

const router = Router();

// Обновление баллов
router.post('/upsert-points', updatePointsController);

// Получение текущих лидеров с наградами
router.get('/current-leaders', getLeadersController);

export default router;
