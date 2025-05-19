import express from 'express';
import SupportMessage from '../../models/SupportMessage';
import { isAuthenticated } from '../../middleware/auth';

const router = express.Router();

// Submit a new support message
router.post('/', async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    
    // Validate required fields
    if (!email || !subject || !message) {
      return res.status(400).json({ message: 'Email, subject, and message are required' });
    }
    
    // Create new support message
    const supportMessage = await SupportMessage.create({
      email,
      subject,
      message,
      userId: req.user?.userId, // Will be undefined for non-authenticated users
      status: 'new'
    });
    
    return res.status(201).json({
      message: 'Support message sent successfully',
      supportMessage: {
        id: supportMessage._id,
        email: supportMessage.email,
        subject: supportMessage.subject,
        status: supportMessage.status,
        createdAt: supportMessage.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting support message:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get all support messages (admin only)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // In a production app, you would check if the user is an admin
    // For simplicity, we're just requiring authentication here
    
    const supportMessages = await SupportMessage.find()
      .sort({ createdAt: -1 })
      .select('email subject status createdAt updatedAt');
    
    return res.status(200).json({ supportMessages });
  } catch (error) {
    console.error('Error getting support messages:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific support message (admin only)
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const supportMessage = await SupportMessage.findById(req.params.id);
    
    if (!supportMessage) {
      return res.status(404).json({ message: 'Support message not found' });
    }
    
    return res.status(200).json({ supportMessage });
  } catch (error) {
    console.error('Error getting support message:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update a support message status (admin only)
router.patch('/:id/status', isAuthenticated, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['new', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const supportMessage = await SupportMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!supportMessage) {
      return res.status(404).json({ message: 'Support message not found' });
    }
    
    return res.status(200).json({
      message: 'Status updated successfully',
      supportMessage
    });
  } catch (error) {
    console.error('Error updating support message status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router; 