import { Router } from 'express';
import { getQueueStats } from '../controllers/queueController.js';

const router = Router();

router.get('/stats', getQueueStats);

export default router;
