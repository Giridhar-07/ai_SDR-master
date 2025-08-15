import nodemailer from "nodemailer";
import { APPLICATION_NAME } from "../constants.js";

export const mailer = async ({ to, subject, text }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER, 
                pass: process.env.SMTP_PASS
            }
        });

        await transporter.sendMail({
            from: `${APPLICATION_NAME}<${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
        });
    } catch (error) {
        console.error("❌ Email sending failed:", error.message);
        throw error;
    }
}

// Send meeting invitation email
export const sendMeetingInvitationEmail = async ({ to, meeting, lead }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER, 
                pass: process.env.SMTP_PASS
            }
        });

        const meetingDate = new Date(meeting.scheduledDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const meetingTime = meeting.scheduledTime;
        const duration = meeting.duration;
        const jitsiLink = `https://meet.jit.si/${meeting.jitsiRoomId}`;

        const subject = `Meeting Invitation: ${meeting.title}`;
        
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Meeting Invitation</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .meeting-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
                    .join-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📅 Meeting Invitation</h1>
                        <p>You have been invited to a meeting</p>
                    </div>
                    
                    <div class="content">
                        <h2>Hello ${lead.name},</h2>
                        
                        <p>You have been invited to attend a meeting with our team. Please find the details below:</p>
                        
                        <div class="meeting-details">
                            <h3>${meeting.title}</h3>
                            <p><strong>📅 Date:</strong> ${meetingDate}</p>
                            <p><strong>⏰ Time:</strong> ${meetingTime}</p>
                            <p><strong>⏱️ Duration:</strong> ${duration} minutes</p>
                            <p><strong>📝 Description:</strong> ${meeting.description}</p>
                            <p><strong>🎯 Type:</strong> ${meeting.meetingType}</p>
                        </div>
                        
                        <p>To join the meeting, please click the button below:</p>
                        
                        <a href="${jitsiLink}" class="join-button">🚀 Join Meeting</a>
                        
                        <p><strong>Meeting Link:</strong> <a href="${jitsiLink}">${jitsiLink}</a></p>
                        
                        <p><strong>Important Notes:</strong></p>
                        <ul>
                            <li>Please join the meeting 5 minutes before the scheduled time</li>
                            <li>Ensure you have a stable internet connection</li>
                            <li>Test your microphone and camera before joining</li>
                            <li>If you have any issues, please contact us immediately</li>
                        </ul>
                        
                        <p>We look forward to meeting with you!</p>
                        
                        <p>Best regards,<br>The AI SDR Team</p>
                    </div>
                    
                    <div class="footer">
                        <p>This is an automated email. Please do not reply to this message.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const textContent = `
Meeting Invitation: ${meeting.title}

Hello ${lead.name},

You have been invited to attend a meeting with our team.

Meeting Details:
- Title: ${meeting.title}
- Date: ${meetingDate}
- Time: ${meetingTime}
- Duration: ${duration} minutes
- Description: ${meeting.description}
- Type: ${meeting.meetingType}

To join the meeting, please visit: ${jitsiLink}

Important Notes:
- Please join the meeting 5 minutes before the scheduled time
- Ensure you have a stable internet connection
- Test your microphone and camera before joining
- If you have any issues, please contact us immediately

We look forward to meeting with you!

Best regards,
The AI SDR Team
        `;

        await transporter.sendMail({
            from: `${APPLICATION_NAME}<${process.env.SMTP_USER}>`,
            to,
            subject,
            text: textContent,
            html: htmlContent,
        });

        console.log(`✅ Meeting invitation email sent to ${to}`);
    } catch (error) {
        console.error("❌ Meeting invitation email failed:", error.message);
        throw error;
    }
};