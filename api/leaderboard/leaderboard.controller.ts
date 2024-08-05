// api/leaderboard/leaderboard.controller.ts
import { Request, Response } from 'express';
import { LeaderboardModel } from './leaderboard.model';

export class LeaderboardController {
    static async getLeaderboard(req: Request, res: Response): Promise<void> {
        const eventId = parseInt(req.query.eventId as string);
        
        if (isNaN(eventId)) {
            res.status(400).send('Invalid event ID');
            return;
        }

        try {
            const leaderboard = await LeaderboardModel.getLeaderboard(eventId);
            res.json(leaderboard);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    static async addOrUpdateEntry(req: Request, res: Response): Promise<void> {
        const { telegram_id, points } = req.body;

        if (typeof telegram_id !== 'number' || typeof points !== 'number') {
            res.status(400).send('Invalid data');
            return;
        }

        try {
            await LeaderboardModel.addOrUpdateEntry(telegram_id, points);
            res.status(200).send('Leaderboard entry added or updated');
        } catch (error) {
            console.error('Error adding/updating leaderboard entry:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}