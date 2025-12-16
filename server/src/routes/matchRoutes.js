import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getMyMatches } from '../controllers/matchController.js';

const router = Router();

router.get('/me', requireAuth, getMyMatches);

export default router;
