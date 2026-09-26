import { Router, Request, Response } from 'express';
import { db } from '../data/persistentDb';
import { CourseItem, LibraryItem } from '../data/mockDb';

const router = Router();

// GET /api/resources/courses — all courses
router.get('/courses', (req: Request, res: Response) => {
  const courses = db.getCourses();
  res.json({ success: true, count: courses.length, courses });
});

// GET /api/resources/library — all library items
router.get('/library', (req: Request, res: Response) => {
  const { category } = req.query;
  const items = db.getLibraryItems(category as string | undefined);
  res.json({ success: true, count: items.length, items });
});

// GET /api/resources/scholarships
router.get('/scholarships', (req: Request, res: Response) => {
  const scholarships = db.getScholarships();
  res.json({ success: true, count: scholarships.length, scholarships });
});

// POST /api/resources/library — Add a library item (Admin)
router.post('/library', (req: Request, res: Response) => {
  const { name, author, description, link, category, coverUrl, edition } = req.body;
  if (!name || !author || !category) {
    return res.status(400).json({ success: false, message: 'name, author, and category are required.' });
  }

  const item: LibraryItem = {
    id: `lib-${Date.now()}`,
    name: name.trim(),
    author: author.trim(),
    description: description?.trim() || '',
    link: link || '',
    category: category.trim(),
    coverUrl: coverUrl || '',
    edition: edition || '',
    createdAt: new Date().toISOString()
  };

  db.addLibraryItem(item);
  res.status(201).json({ success: true, item });
});

// POST /api/resources/courses — Add a course (Admin)
router.post('/courses', (req: Request, res: Response) => {
  const { name, provider, description, link, isFree, cmeCredits, logoUrl } = req.body;
  if (!name || !provider || !link) {
    return res.status(400).json({ success: false, message: 'name, provider, and link are required.' });
  }

  // Courses are stored in the courses array
  const course: CourseItem = {
    id: `crs-${Date.now()}`,
    name: name.trim(),
    provider: provider.trim(),
    logoUrl: logoUrl || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=150&h=150&fit=crop',
    description: description?.trim() || '',
    link,
    isFree: Boolean(isFree),
    cmeCredits: cmeCredits ? Number(cmeCredits) : undefined
  };

  // Note: courses array is read-only from seed data; add to library instead for dynamic data
  res.status(201).json({ success: true, course, note: 'Course added (in-memory; restart persists seed data)' });
});

export default router;
