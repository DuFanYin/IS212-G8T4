const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL,
        pass: process.env.GMAIL_PASSWORD
      }
    });
  }

  async sendPasswordResetEmail(email, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/login/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: process.env.GMAIL,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>You have requested to reset your password. Click the link below to reset your password:</p>
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            <p style="margin-top: 20px; color: #666;">This link will expire in 1 hour.</p>
            <p style="color: #666;">If you didn't request this password reset, please ignore this email.</p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendInvitationEmail(email, invitationToken, role) {
    try {
      const registrationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/register?token=${invitationToken}`;
      
      const mailOptions = {
        from: process.env.GMAIL,
        to: email,
        subject: 'Invitation to Join Task Management System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">You're Invited!</h2>
            <p>Hello,</p>
            <p>You have been invited to join our Task Management System with the role of <strong>${role}</strong>.</p>
            <p>Click the link below to create your account and get started:</p>
            <a href="${registrationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Create Account</a>
            <p style="margin-top: 20px; color: #666;">This invitation link will expire in 7 days.</p>
            <p style="color: #666;">If you didn't expect this invitation, please ignore this email.</p>
            <p style="color: #666;">Best regards,<br>Task Management Team</p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending invitation email:', error);
      throw new Error('Failed to send invitation email');
    }
  }
}

module.exports = EmailService;
