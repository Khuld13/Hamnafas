// Local human-support directory route. Unauthenticated on purpose — a person
// in distress should never be blocked from seeing help by a login/session
// requirement, and this data carries no personal information.

import { Router } from 'express';
import type { Request, Response } from 'express';
import { getLocalSupportDirectory } from '../data/localSupportDirectory.js';

const router = Router();

/** GET /api/support/local?city=Lahore */
router.get('/local', (req: Request, res: Response) => {
  const city = typeof req.query.city === 'string' ? req.query.city : undefined;
  res.status(200).json(getLocalSupportDirectory(city));
});

export default router;
