
import { Router } from 'express';
import { InventoryService } from '../../services/inventory.service';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const tenantId = req.tenantId!;
    const items = await InventoryService.getInventory(tenantId);
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

router.post('/adjust', async (req, res) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user?.id || 'system'; // Fallback if auth user missing (shouldn't happen with middleware)
    const { itemId, delta, reason } = req.body;

    if (!itemId || delta === undefined) {
      return res.status(400).json({ error: 'Missing itemId or delta' });
    }

    const result = await InventoryService.adjustStock(tenantId, userId, itemId, Number(delta), reason || 'Manual Adjustment');
    res.json(result);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to adjust stock' });
  }
});

export default router;
