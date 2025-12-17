
import { Router } from 'express';
import { AuthService } from '../../services/auth.service';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const result = await AuthService.login(req.body);
    res.json(result);
  } catch (error: any) {
    // Determine status code based on error
    const status = error.message === 'Invalid credentials' ? 401 : 400;
    res.status(status).json({ error: error.message || 'Login failed' });
  }
});

export default router;
