import { Router, Request, Response } from 'express';
const router = Router();
router.get('/', (req: Request, res: Response) => { res.json({ success: true, count: 0, notifications: [] }); });
export default router;
