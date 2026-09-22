import { Router, Request, Response } from 'express';
import { db } from '../data/persistentDb';
import { Story } from '../data/mockDb';

const router = Router();

// GET /api/stories
router.get('/', (req: Request, res: Response) => {
  try {
    const stories = db.getStories();
    res.json({
      success: true,
      count: stories.length,
      stories
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stories',
      error: error.message
    });
  }
});

// POST /api/stories - Create new 24h story from device with caption & hashtags
router.post('/', (req: Request, res: Response) => {
  try {
    const { userId, userName, userAvatar, mediaUrl, caption, clinicalTags, isVideo } = req.body;

    if (!mediaUrl) {
      return res.status(400).json({
        success: false,
        message: 'mediaUrl is required for stories'
      });
    }

    const newStory: Story = {
      id: `story-${Date.now()}`,
      userId: userId || 'anonymous',
      userName: userName || 'Medical Professional',
      userAvatar: userAvatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop',
      mediaUrl,
      caption: caption || '',
      timestamp: 'Just now',
      isViewed: false,
      isVideo: Boolean(isVideo)
    };

    if (clinicalTags && Array.isArray(clinicalTags)) {
      newStory.clinicalTags = clinicalTags;
    }

    const createdStory = db.addStory(newStory);

    res.status(201).json({
      success: true,
      message: 'Story created successfully and saved to local database & MySQL',
      story: createdStory
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create story',
      error: error.message
    });
  }
});

// DELETE /api/stories/:id - Delete a story
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = db.deleteStory(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }
    res.json({
      success: true,
      message: 'Story deleted successfully',
      id
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete story',
      error: error.message
    });
  }
});

export default router;
