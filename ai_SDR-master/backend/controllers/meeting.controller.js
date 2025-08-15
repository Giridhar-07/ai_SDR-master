import Meeting from '../models/meeting.model.js';
import { LeadModel as Lead } from '../models/leads.model.js';
import { createNotification } from './notification.controller.js';
import { sendMeetingInvitationEmail } from '../utils/email.service.js';
import logger from '../utils/logger.js';

// Schedule a new meeting
const scheduleMeeting = async (req, res) => {
  try {
    const {
      leadId,
      title,
      description,
      scheduledDate,
      scheduledTime,
      duration,
      meetingType,
      jitsiRoomId
    } = req.body;

    const adminId = req.admin.id;

    // Validate lead exists
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Create meeting
    const meeting = new Meeting({
      leadId,
      adminId,
      title,
      description,
      scheduledDate,
      scheduledTime,
      duration,
      meetingType,
      jitsiRoomId
    });

    await meeting.save();

    // Update lead status to meeting
    await Lead.findByIdAndUpdate(leadId, {
      status: 'meeting',
      readyToMeet: true,
      meetingDate: scheduledDate
    });

    // Create notification
    await createNotification({
      adminId,
      type: 'meeting_scheduled',
      title: 'New Meeting Scheduled',
      message: `Meeting scheduled with ${lead.name} on ${new Date(scheduledDate).toLocaleDateString()}`,
      data: { meetingId: meeting._id, leadId }
    });

    logger.info(`Meeting scheduled: ${meeting._id} for lead: ${leadId}`);

    res.status(201).json({
      success: true,
      message: 'Meeting scheduled successfully',
      meeting
    });

  } catch (error) {
    logger.error('Error scheduling meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule meeting',
      error: error.message
    });
  }
};

// Get all meetings for an admin
const getAllMeetings = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { page = 1, limit = 10, status, date } = req.query;

    const query = { adminId };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const searchDate = new Date(date);
      const startOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate());
      const endOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate(), 23, 59, 59);
      query.scheduledDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const meetings = await Meeting.find(query)
      .populate('leadId', 'name email company phone location role')
      .sort({ scheduledDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Meeting.countDocuments(query);

    res.status(200).json({
      success: true,
      meetings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    logger.error('Error fetching meetings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meetings',
      error: error.message
    });
  }
};

// Get meeting by ID
const getMeetingById = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;

    const meeting = await Meeting.findOne({ _id: id, adminId })
      .populate('leadId', 'name email company phone location role industry experience leadScore');

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    res.status(200).json({
      success: true,
      meeting
    });

  } catch (error) {
    logger.error('Error fetching meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meeting',
      error: error.message
    });
  }
};

// Update meeting
const updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;
    const updateData = req.body;

    const meeting = await Meeting.findOneAndUpdate(
      { _id: id, adminId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Create notification for meeting update
    await createNotification({
      adminId,
      type: 'meeting_updated',
      title: 'Meeting Updated',
      message: `Meeting "${meeting.title}" has been updated`,
      data: { meetingId: meeting._id }
    });

    logger.info(`Meeting updated: ${meeting._id}`);

    res.status(200).json({
      success: true,
      message: 'Meeting updated successfully',
      meeting
    });

  } catch (error) {
    logger.error('Error updating meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update meeting',
      error: error.message
    });
  }
};

// Delete meeting
const deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;

    const meeting = await Meeting.findOneAndDelete({ _id: id, adminId });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Update lead status back to previous state
    await Lead.findByIdAndUpdate(meeting.leadId, {
      status: 'follow-up',
      readyToMeet: false,
      meetingDate: null
    });

    // Create notification for meeting deletion
    await createNotification({
      adminId,
      type: 'meeting_deleted',
      title: 'Meeting Deleted',
      message: `Meeting "${meeting.title}" has been deleted`,
      data: { leadId: meeting.leadId }
    });

    logger.info(`Meeting deleted: ${meeting._id}`);

    res.status(200).json({
      success: true,
      message: 'Meeting deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete meeting',
      error: error.message
    });
  }
};

// Send meeting invitation email
const sendMeetingInvitation = async (req, res) => {
  try {
    const { meetingId, leadEmail } = req.body;
    const adminId = req.admin.id;

    const meeting = await Meeting.findOne({ _id: meetingId, adminId })
      .populate('leadId', 'name email company');

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Send email invitation
    await sendMeetingInvitationEmail({
      to: leadEmail,
      meeting: meeting,
      lead: meeting.leadId
    });

    // Update meeting to mark email as sent
    meeting.emailSent = true;
    meeting.emailSentAt = new Date();
    await meeting.save();

    logger.info(`Meeting invitation sent for meeting: ${meeting._id}`);

    res.status(200).json({
      success: true,
      message: 'Meeting invitation sent successfully'
    });

  } catch (error) {
    logger.error('Error sending meeting invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send meeting invitation',
      error: error.message
    });
  }
};

// Get upcoming meetings
const getUpcomingMeetings = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { limit = 5 } = req.query;

    const meetings = await Meeting.getUpcomingMeetings(adminId)
      .populate('leadId', 'name email company')
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      meetings
    });

  } catch (error) {
    logger.error('Error fetching upcoming meetings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming meetings',
      error: error.message
    });
  }
};

// Get today's meetings
const getTodaysMeetings = async (req, res) => {
  try {
    const adminId = req.admin.id;

    const meetings = await Meeting.getTodaysMeetings(adminId)
      .populate('leadId', 'name email company');

    res.status(200).json({
      success: true,
      meetings
    });

  } catch (error) {
    logger.error('Error fetching today\'s meetings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s meetings',
      error: error.message
    });
  }
};

// Join meeting (update status to in-progress)
const joinMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;

    const meeting = await Meeting.findOne({ _id: id, adminId });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Check if meeting time has arrived
    const now = new Date();
    const meetingTime = new Date(meeting.scheduledDate);
    meetingTime.setHours(parseInt(meeting.scheduledTime.split(':')[0]), parseInt(meeting.scheduledTime.split(':')[1]));

    if (now < meetingTime) {
      return res.status(400).json({
        success: false,
        message: 'Meeting has not started yet'
      });
    }

    meeting.status = 'in-progress';
    await meeting.save();

    logger.info(`Meeting joined: ${meeting._id}`);

    res.status(200).json({
      success: true,
      message: 'Meeting joined successfully',
      meeting
    });

  } catch (error) {
    logger.error('Error joining meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join meeting',
      error: error.message
    });
  }
};

// Complete meeting
const completeMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;
    const { notes } = req.body;

    const meeting = await Meeting.findOne({ _id: id, adminId });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    meeting.status = 'completed';
    if (notes) {
      meeting.notes = notes;
    }
    await meeting.save();

    // Update lead status
    await Lead.findByIdAndUpdate(meeting.leadId, {
      status: 'closed'
    });

    logger.info(`Meeting completed: ${meeting._id}`);

    res.status(200).json({
      success: true,
      message: 'Meeting completed successfully',
      meeting
    });

  } catch (error) {
    logger.error('Error completing meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete meeting',
      error: error.message
    });
  }
};

export {
  scheduleMeeting,
  getAllMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  sendMeetingInvitation,
  getUpcomingMeetings,
  getTodaysMeetings,
  joinMeeting,
  completeMeeting
};
