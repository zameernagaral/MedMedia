import { Router, Request, Response } from 'express';
import { db } from '../data/persistentDb';
import { SupportTicket } from '../data/mockDb';

const router = Router();

// POST /api/admin/support - Support Query Form forwarded to medmedia1409@gmail.com
router.post('/support', (req: Request, res: Response) => {
  const { userId, userName, userEmail, category, description } = req.body;

  if (!description || !category) {
    return res.status(400).json({ success: false, message: "Category and description are required." });
  }

  const ticket: SupportTicket = {
    id: `ticket-${Date.now()}`,
    userId: userId || "doc-1",
    userName: userName || "Healthcare Professional",
    userEmail: userEmail || "medmedia1409@gmail.com",
    category,
    description,
    forwardedTo: "medmedia1409@gmail.com",
    status: "RECEIVED",
    createdAt: new Date().toISOString()
  };

  db.createSupportTicket(ticket);

  res.json({
    success: true,
    message: "Your inquiry has been submitted and forwarded directly to MedMedia Support at medmedia1409@gmail.com. Our clinical engineering team will respond within 24-48 hours.",
    ticket
  });
});

// GET /api/admin/support - Manager/Admin view of support tickets
router.get('/support', (req: Request, res: Response) => {
  res.json({
    success: true,
    tickets: db.getSupportTickets()
  });
});

// POST /api/admin/clear - Wipes all platform data
router.post('/clear', async (req: Request, res: Response) => {
  try {
    await db.clearAllData();
    res.json({
      success: true,
      message: 'All platform data cleared successfully. Ready for clean launch.',
      stats: db.getStats()
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear database: ' + err.message
    });
  }
});

// POST /api/admin/seed - Repopulates realistic clinical demo data
router.post('/seed', async (req: Request, res: Response) => {
  try {
    await db.seedClinicalDemoData();
    res.json({
      success: true,
      message: 'Realistic clinical dataset populated successfully.',
      stats: db.getStats()
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to seed demo data: ' + err.message
    });
  }
});

// GET /api/admin/stats - Returns entity counts and system state
router.get('/stats', (req: Request, res: Response) => {
  res.json({
    success: true,
    stats: db.getStats()
  });
});

// DELETE /api/admin/community/:id - Manager moderation
router.delete('/community/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const success = db.deleteCommunity(id);
  res.json({ success });
});

// DELETE /api/admin/job/:id - Manager moderation
router.delete('/job/:id', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const success = db.deleteJob(id);
  res.json({ success });
});

// POST /api/admin/research/:id/approve - Manager approval
router.post('/research/:id/approve', (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { userId } = req.body;
  const result = db.approveJoinResearch(id, userId);
  res.json(result);
});

export default router;
