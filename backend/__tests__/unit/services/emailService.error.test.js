const EmailService = require('../../../src/services/emailService');

// Mock nodemailer
const mockSendMail = jest.fn();
jest.mock('nodemailer', () => {
  return {
    createTransport: jest.fn(() => ({
      sendMail: mockSendMail
    }))
  };
});

describe('EmailService - Error Handling', () => {
  let emailService;

  beforeEach(() => {
    emailService = new EmailService();
    jest.clearAllMocks();
  });

  describe('sendPasswordResetEmail - Error Cases', () => {
    it('should handle sendMail errors', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));
      
      await expect(
        emailService.sendPasswordResetEmail('122686006h@gmail.com', 'token')
      ).rejects.toThrow('Failed to send password reset email');
    });

    it('should handle email errors gracefully', async () => {
      mockSendMail.mockRejectedValue(new Error('Network error'));
      
      await expect(
        emailService.sendPasswordResetEmail('122686006h@gmail.com', 'token')
      ).rejects.toThrow();
    });
  });

  describe('sendInvitationEmail - Error Cases', () => {
    it('should handle sendMail errors', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));
      
      await expect(
        emailService.sendInvitationEmail('122686006h@gmail.com', 'token', 'staff')
      ).rejects.toThrow('Failed to send invitation email');
    });

    it('should handle network errors', async () => {
      mockSendMail.mockRejectedValue(new Error('Network timeout'));
      
      await expect(
        emailService.sendInvitationEmail('122686006h@gmail.com', 'token', 'manager')
      ).rejects.toThrow();
    });
  });
});

