import { Router, Request, Response } from 'express';
const router = Router();
router.get('/metrics', (req: Request, res: Response) => { res.json({ success: true, metrics: {} }); });
export default router;
