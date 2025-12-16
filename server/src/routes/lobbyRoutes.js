import { Router } from 'express';
import { getLobbyById } from '../controllers/lobbyController.js';

const router = Router();

router.get('/:id', getLobbyById);

export default router;
