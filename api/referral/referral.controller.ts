// referral.controller.ts

import { Request, Response } from 'express';
import { getInvitedCount } from './referral.model';

async function getInvitedCountHandler(req: Request, res: Response): Promise<void> {
  const { invitedByTelegramId } = req.params;
  try {
    const invitedCount = await getInvitedCount(parseInt(invitedByTelegramId, 10));
    res.json({ invitedCount });
  } catch (error) {
    console.error('Ошибка при получении количества приглашенных:', error);
    res.status(500).json({ message: 'Произошла ошибка при получении количества приглашенных' });
  }
}

export { getInvitedCountHandler };
