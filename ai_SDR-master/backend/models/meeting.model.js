import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    enum: [15, 30, 45, 60, 90, 120]
  },
  meetingType: {
    type: String,
    required: true,
    enum: ['video', 'audio', 'presentation', 'discussion']
  },
  jitsiRoomId: {
    type: String,
    required: true,
    unique: true
  },
  meetingLink: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
meetingSchema.index({ leadId: 1, scheduledDate: 1 });
meetingSchema.index({ adminId: 1, scheduledDate: 1 });
meetingSchema.index({ status: 1, scheduledDate: 1 });
meetingSchema.index({ jitsiRoomId: 1 });

// Virtual for full meeting date
meetingSchema.virtual('fullMeetingDate').get(function() {
  if (this.scheduledDate && this.scheduledTime) {
    const date = new Date(this.scheduledDate);
    const [hours, minutes] = this.scheduledTime.split(':');
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date;
  }
  return null;
});

// Virtual for meeting end time
meetingSchema.virtual('endTime').get(function() {
  if (this.fullMeetingDate && this.duration) {
    const endTime = new Date(this.fullMeetingDate);
    endTime.setMinutes(endTime.getMinutes() + this.duration);
    return endTime;
  }
  return null;
});

// Virtual for time until meeting
meetingSchema.virtual('timeUntilMeeting').get(function() {
  if (this.fullMeetingDate) {
    const now = new Date();
    const meetingTime = this.fullMeetingDate;
    return meetingTime - now;
  }
  return null;
});

// Virtual for isUpcoming
meetingSchema.virtual('isUpcoming').get(function() {
  if (this.fullMeetingDate) {
    return this.fullMeetingDate > new Date();
  }
  return false;
});

// Virtual for isToday
meetingSchema.virtual('isToday').get(function() {
  if (this.fullMeetingDate) {
    const today = new Date();
    return this.fullMeetingDate.toDateString() === today.toDateString();
  }
  return false;
});

// Pre-save middleware to update meetingLink
meetingSchema.pre('save', function(next) {
  if (this.jitsiRoomId && !this.meetingLink) {
    this.meetingLink = `https://meet.jit.si/${this.jitsiRoomId}`;
  }
  this.updatedAt = new Date();
  next();
});

// Method to check if meeting is in progress
meetingSchema.methods.isInProgress = function() {
  if (!this.fullMeetingDate || !this.duration) return false;
  
  const now = new Date();
  const startTime = this.fullMeetingDate;
  const endTime = new Date(startTime.getTime() + (this.duration * 60 * 1000));
  
  return now >= startTime && now <= endTime;
};

// Method to check if meeting is overdue
meetingSchema.methods.isOverdue = function() {
  if (!this.fullMeetingDate || !this.duration) return false;
  
  const now = new Date();
  const endTime = new Date(this.fullMeetingDate.getTime() + (this.duration * 60 * 1000));
  
  return now > endTime && this.status === 'scheduled';
};

// Static method to get upcoming meetings
meetingSchema.statics.getUpcomingMeetings = function(adminId = null) {
  const query = {
    scheduledDate: { $gte: new Date() },
    status: { $in: ['scheduled', 'confirmed'] }
  };
  
  if (adminId) {
    query.adminId = adminId;
  }
  
  return this.find(query).sort({ scheduledDate: 1 });
};

// Static method to get today's meetings
meetingSchema.statics.getTodaysMeetings = function(adminId = null) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  
  const query = {
    scheduledDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['scheduled', 'confirmed'] }
  };
  
  if (adminId) {
    query.adminId = adminId;
  }
  
  return this.find(query).sort({ scheduledDate: 1 });
};

export default mongoose.model('Meeting', meetingSchema);
