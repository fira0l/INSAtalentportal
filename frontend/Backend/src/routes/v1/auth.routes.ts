import { Router } from 'express';

import { loginHandler, registerHandler, meHandler, registerAdminHandler } from '../../controllers/auth.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();

router.post('/register', registerHandler);
router.post('/register-admin', registerAdminHandler);
router.post('/login', loginHandler);
router.get('/me', requireAuth, meHandler);

export default router;
