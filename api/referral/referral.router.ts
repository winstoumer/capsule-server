// referral.router.ts

import { Router } from 'express';
import { getInvitedCountHandler } from './referral.controller';

const referralRouter = Router();

referralRouter.get('/:invitedByTelegramId', getInvitedCountHandler);

export default referralRouter;
