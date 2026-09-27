import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service configuration error:', error);
  } else {
    console.log('✅ Email service is ready');
  }
});

// Send ticket created notification to employee
export const sendTicketCreatedEmail = async (employeeEmail, ticketData) => {
  try {
    console.log(`📧 Attempting to send email to employee: ${employeeEmail}`);

    const mailOptions = {
      from: `"ThinkAuto Support" <${process.env.EMAIL_USER}>`,
      to: employeeEmail,
      subject: `Ticket Created Successfully - ${ticketData.ticketNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .ticket-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .label { font-weight: bold; color: #f97316; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .badge-high { background: #fecaca; color: #991b1b; }
            .badge-medium { background: #fed7aa; color: #9a3412; }
            .badge-low { background: #d1fae5; color: #065f46; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🎫 Your Ticket Has Been Created</h2>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Your support ticket has been successfully created and ${ticketData.assignedTo ? `assigned to our <strong>${ticketData.category}</strong> specialist` : 'our team will review it shortly'}.</p>
              
              <div class="ticket-info">
                <p><span class="label">Ticket ID:</span> ${ticketData.ticketNumber}</p>
                <p><span class="label">Category:</span> ${ticketData.category}</p>
                <p><span class="label">Priority:</span> <span class="badge badge-${ticketData.priority.toLowerCase()}">${ticketData.priority}</span></p>
                <p><span class="label">Status:</span> ${ticketData.status}</p>
                <p><span class="label">Description:</span> ${ticketData.description}</p>
                ${ticketData.assignedTo ? `<p><span class="label">Assigned Technician:</span> ${ticketData.assignedTo.name} (${ticketData.assignedTo.email})</p>` : '<p><span class="label">Status:</span> Waiting for assignment</p>'}
              </div>
              
              ${ticketData.assignedTo ? '<p>✅ <strong>A technician has been assigned to resolve your issue.</strong> They will contact you soon.</p>' : ''}
              
              <p><strong>Resolution window:</strong> The technician must complete and verify this ticket with your OTP within 24 hours. If it is not verified in time, it will be marked as unsolved.</p>
              <p>You can track your ticket status in the <strong>My Tickets</strong> section of your dashboard.</p>
              
              <p>Best regards,<br>ThinkAuto Support Team</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Employee email sent successfully to ${employeeEmail}`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error sending employee email to ${employeeEmail}:`, error);
    console.error(`   Error code: ${error.code}`);
    console.error(`   Error message: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Send ticket assignment notification to technician
export const sendTicketAssignedEmail = async (technicianEmail, technicianName, ticketData) => {
  try {
    console.log(`📧 Attempting to send email to technician: ${technicianEmail}`);

    const mailOptions = {
      from: `"ThinkAuto Support" <${process.env.EMAIL_USER}>`,
      to: technicianEmail,
      subject: `New Ticket Assigned - ${ticketData.ticketNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .ticket-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .label { font-weight: bold; color: #3b82f6; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .badge-high { background: #fecaca; color: #991b1b; }
            .badge-medium { background: #fed7aa; color: #9a3412; }
            .badge-low { background: #d1fae5; color: #065f46; }
            .badge-critical { background: #dc2626; color: white; }
            .action-btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🔔 New Ticket Assigned to You</h2>
            </div>
            <div class="content">
              <p>Hello ${technicianName},</p>
              <p>A new <strong>${ticketData.category}</strong> ticket has been assigned to you based on your expertise. Please help resolve this employee's issue.</p>
              
              <div class="ticket-info">
                <p><span class="label">Ticket ID:</span> ${ticketData.ticketNumber}</p>
                <p><span class="label">Category:</span> ${ticketData.category}</p>
                <p><span class="label">Priority:</span> <span class="badge badge-${ticketData.priority.toLowerCase()}">${ticketData.priority}</span></p>
                <p><span class="label">Status:</span> ${ticketData.status}</p>
                <p><span class="label">Employee:</span> ${ticketData.createdBy.name} (${ticketData.createdBy.email})</p>
                <p><span class="label">Issue Description:</span> ${ticketData.description}</p>
              </div>
              
              <p>📞 <strong>Action Required:</strong> Please contact the employee at <a href="mailto:${ticketData.createdBy.email}">${ticketData.createdBy.email}</a> to resolve this ${ticketData.priority} priority issue.</p>
              <p><strong>24-hour completion rule:</strong> Resolve the issue, request the employee OTP, and verify completion within 24 hours. Unverified tickets are marked as unsolved.</p>
              
              <a href="http://localhost:8081/tickets/${ticketData._id}" class="action-btn">View & Update Ticket</a>
              
              <p style="margin-top: 20px;">Best regards,<br>ThinkAuto System</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Technician email sent successfully to ${technicianEmail}`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error sending technician email to ${technicianEmail}:`, error);
    console.error(`   Error code: ${error.code}`);
    console.error(`   Error message: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Send OTP verification email to employee
export const sendOTPEmail = async (employeeEmail, employeeName, ticketData, otp) => {
  try {
    const mailOptions = {
      from: `"ThinkAuto Support" <${process.env.EMAIL_USER}>`,
      to: employeeEmail,
      subject: `Ticket Completion Verification - ${ticketData.ticketNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .otp-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #10b981; }
            .otp-code { font-size: 36px; font-weight: bold; color: #10b981; letter-spacing: 8px; font-family: monospace; }
            .ticket-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .label { font-weight: bold; color: #10b981; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🔐 Ticket Completion Verification</h2>
            </div>
            <div class="content">
              <p>Hello ${employeeName},</p>
              <p>Your ticket has been resolved by our technician. Please verify the completion using the OTP below:</p>
              
              <div class="otp-box">
                <p style="margin: 0 0 10px 0; color: #10b981; font-weight: bold;">Your Verification Code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">Valid for 15 minutes</p>
              </div>

              <div class="ticket-info">
                <p><span class="label">Ticket ID:</span> ${ticketData.ticketNumber}</p>
                <p><span class="label">Category:</span> ${ticketData.category}</p>
                <p><span class="label">Priority:</span> ${ticketData.priority}</p>
                <p><span class="label">Description:</span> ${ticketData.description}</p>
              </div>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong> This OTP is valid for 15 minutes. Do not share this code with anyone. If you did not request this verification, please contact IT support immediately.
              </div>
              
              <p>Once verified, your ticket will be marked as completed. If the ticket is not verified within 24 hours of creation, it will be marked as unsolved.</p>
              
              <p style="margin-top: 20px;">Best regards,<br>ThinkAuto Support Team</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP verification email sent to: ${employeeEmail}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

