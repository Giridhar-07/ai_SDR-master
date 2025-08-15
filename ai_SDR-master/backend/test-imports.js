// Test file to verify all imports are working
import { LeadModel } from './models/leads.model.js';
import Meeting from './models/meeting.model.js';
import { createNotification } from './controllers/notification.controller.js';
import { sendMeetingInvitationEmail } from './utils/email.service.js';
import logger from './utils/logger.js';

console.log('✅ All imports successful!');
console.log('LeadModel:', typeof LeadModel);
console.log('Meeting:', typeof Meeting);
console.log('createNotification:', typeof createNotification);
console.log('sendMeetingInvitationEmail:', typeof sendMeetingInvitationEmail);
console.log('logger:', typeof logger);

console.log('🎉 Backend imports are working correctly!');
