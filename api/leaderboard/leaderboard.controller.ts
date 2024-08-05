// api/leaderboard/leaderboard.controller.ts
import { Request, Response } from 'express';
import { LeaderboardModel } from './leaderboard.model';

export class LeaderboardController {
    static async getLeaderboard(req: Request, res: Response): Promise<void> {
        try {
            const eventId = parseInt(req.query.eventId as string, 10);
            if (isNaN(eventId)) {
                res.status(400).json({ error: 'Invalid event ID' });
                return;
            }

            const leaderboard = await LeaderboardModel.getLeaderboard(eventId);
            res.json(leaderboard);
        } catch (error) {
            console.error('Error in getLeaderboard:', error);
            res.status(500).json({ error: 'Failed to fetch leaderboard' });
        }
    }

    static async addOrUpdateEntry(req: Request, res: Response): Promise<void> {
        try {
            const { telegramId, points } = req.body;

            if (!telegramId || points == null) {
                res.status(400).json({ error: 'Missing required fields' });
                return;
            }

            await LeaderboardModel.addOrUpdateEntry(telegramId, points);
            res.status(200).json({ message: 'Entry added or updated successfully' });
        } catch (error) {
            console.error('Error in addOrUpdateEntry:', error);
            res.status(500).json({ error: 'Failed to add or update entry' });
        }
    }
}