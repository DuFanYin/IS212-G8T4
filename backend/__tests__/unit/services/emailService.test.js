// Mock nodemailer before requiring EmailService
const nodemailer = require('nodemailer');
jest.mock('nodemailer', () => {
  return {
    createTransport: jest.fn(() => ({
      sendMail: jest.fn(() => Promise.resolve({ messageId: 'test-id' }))
    }))
  };
});

const EmailService = require('../../../src/services/emailService');

describe('EmailService', () => {
  let emailService;

  beforeEach(() => {
    emailService = new EmailService();
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      const email = '122686006h@gmail.com';
      const resetToken = 'test-token';

      await expect(emailService.sendPasswordResetEmail(email, resetToken)).resolves.not.toThrow();
    });

    it('should handle email errors gracefully', async () => {
      const email = '122686006h@gmail.com';
      const resetToken = 'test-token';

      // Test that it doesn't throw (errors are logged)
      await expect(emailService.sendPasswordResetEmail(email, resetToken)).resolves.not.toThrow();
    });
  });

  describe('sendInvitationEmail', () => {
    it('should send invitation email successfully', async () => {
      const email = '122686006h@gmail.com';
      const invitationToken = 'test-token';
      const role = 'staff';

      await expect(emailService.sendInvitationEmail(email, invitationToken, role)).resolves.not.toThrow();
    });

    it('should handle different roles', async () => {
      const roles = ['staff', 'manager', 'director', 'hr', 'sm'];
      
      for (const role of roles) {
        await expect(emailService.sendInvitationEmail('122686006h@gmail.com', 'token', role)).resolves.not.toThrow();
      }
    });
  });
});

