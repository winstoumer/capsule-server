// api/leaderboard/leaderboard.controller.ts
import { Request, Response } from 'express';
import { upsertPoints, getCurrentLeadersWithRewards } from './leaderboard.model';

export const updatePointsController = async (req: Request, res: Response): Promise<void> => {
    const { telegramId, points } = req.body;

    if (typeof telegramId !== 'number' || typeof points !== 'number') {
        res.status(400).json({ error: 'Invalid input' });
        return;
    }

    try {
        await upsertPoints(telegramId, points);
        res.status(200).json({ message: 'Points updated successfully' });
    } catch (error) {
        console.error('Error updating points:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getLeadersController = async (req: Request, res: Response): Promise<void> => {
    try {
        const leaders = await getCurrentLeadersWithRewards();
        res.status(200).json(leaders);
    } catch (error) {
        console.error('Error getting leaders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
