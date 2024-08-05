// api/leaderboard/leaderboard.router.ts
import { Router } from 'express';
import { LeaderboardController } from './leaderboard.controller';

const router = Router();

router.get('/leaderboard', LeaderboardController.getLeaderboard);
router.post('/leaderboard-update', LeaderboardController.addOrUpdateEntry);

export default router;
