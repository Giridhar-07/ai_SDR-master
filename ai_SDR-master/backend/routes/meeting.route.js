import express from 'express';
import * as meetingController from '../controllers/meeting.controller.js';
import { adminMiddleware } from '../middlewares/admin.middleware.js';

const router = express.Router();

// Test endpoint to verify routes are working
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Meeting routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Apply admin middleware to all routes except test
router.use(adminMiddleware);

// Schedule a new meeting
router.post('/schedule', meetingController.scheduleMeeting);

// Get all meetings for the admin
router.get('/', meetingController.getAllMeetings);

// Get upcoming meetings
router.get('/upcoming', meetingController.getUpcomingMeetings);

// Get today's meetings
router.get('/today', meetingController.getTodaysMeetings);

// Get meeting by ID
router.get('/:id', meetingController.getMeetingById);

// Update meeting
router.put('/:id', meetingController.updateMeeting);

// Delete meeting
router.delete('/:id', meetingController.deleteMeeting);

// Send meeting invitation email
router.post('/send-invitation', meetingController.sendMeetingInvitation);

// Join meeting
router.post('/:id/join', meetingController.joinMeeting);

// Complete meeting
router.post('/:id/complete', meetingController.completeMeeting);

export default router;
