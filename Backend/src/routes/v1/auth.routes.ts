import { Router } from 'express';

import { loginHandler, registerHandler, meHandler } from '../../controllers/auth.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.get('/me', requireAuth, meHandler);

export default router;


