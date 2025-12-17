
import { Router } from 'express';
import { AdminService } from '../../services/admin.service';

const router = Router();

// --- SETTINGS ---
router.get('/settings', async (req, res) => {
  try {
    const data = await AdminService.getSettings(req.tenantId!);
    res.json(data || {});
  } catch (e) { res.status(500).json({error: e}); }
});

router.put('/settings', async (req, res) => {
  try {
    const data = await AdminService.updateSettings(req.tenantId!, req.body);
    res.json(data);
  } catch (e) { res.status(500).json({error: e}); }
});

// --- BRANCHES ---
router.get('/branches', async (req, res) => {
  try {
    const data = await AdminService.getBranches(req.tenantId!);
    res.json(data);
  } catch (e) { res.status(500).json({error: e}); }
});

router.post('/branches', async (req, res) => {
  try {
    const data = await AdminService.upsertBranch(req.tenantId!, req.body);
    res.json(data);
  } catch (e) { res.status(500).json({error: e}); }
});

// --- USERS ---
router.get('/users', async (req, res) => {
  try {
    const data = await AdminService.getUsers(req.tenantId!);
    res.json(data);
  } catch (e) { res.status(500).json({error: e}); }
});

router.post('/users', async (req, res) => {
  try {
    const data = await AdminService.upsertUser(req.tenantId!, req.body);
    res.json(data);
  } catch (e) { res.status(500).json({error: e}); }
});

export default router;
