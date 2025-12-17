
import { Router } from 'express';
import { OrderService } from '../../services/order.service';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const tenantId = req.tenantId!;
    const orderData = req.body;

    // TODO: Add Zod Validation here

    const result = await OrderService.createOrder(tenantId, orderData);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process order' });
  }
});

export default router;
