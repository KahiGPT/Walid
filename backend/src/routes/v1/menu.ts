
import { Router } from 'express';
import { MenuService } from '../../services/menu.service';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const tenantId = req.tenantId!;
    const menu = await MenuService.getFullMenu(tenantId);
    res.json(menu);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

export default router;
