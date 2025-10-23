// Mock dependencies before importing
jest.mock('../../../src/db/models');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');
jest.mock('crypto');
jest.mock('../../../src/services/emailService');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User } = require('../../../src/db/models');
const EmailService = require('../../../src/services/emailService');

describe('AuthController', () => {
  let authController;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    authController = require('../../../src/controllers/authController');
    
    mockReq = {
      body: {}
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Set up environment variable
    process.env.JWT_SECRET = 'test-secret';
    
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        _id: 'user1',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        name: 'Test User',
        role: 'staff'
      };

      mockReq.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-jwt-token');

      await authController.login(mockReq, mockRes);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 'user1', email: 'test@example.com', role: 'staff' },
        'test-secret',
        { expiresIn: '24h' }
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          token: 'mock-jwt-token',
          user: {
            id: 'user1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'staff'
          }
        }
      });
    });

    it('should return error when email is missing', async () => {
      mockReq.body = { password: 'password123' };

      await authController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Email and password are required'
      });
    });

    it('should return error when password is missing', async () => {
      mockReq.body = { email: 'test@example.com' };

      await authController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Email and password are required'
      });
    });

    it('should return error for invalid email format', async () => {
      mockReq.body = {
        email: 'invalid-email',
        password: 'password123'
      };

      await authController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Please provide a valid email address'
      });
    });

    it('should return error when user not found', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(null);

      await authController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid email or password'
      });
    });

    it('should return error when password is invalid', async () => {
      const mockUser = {
        _id: 'user1',
        email: 'test@example.com',
        passwordHash: 'hashedPassword'
      };

      mockReq.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await authController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid email or password'
      });
    });

    it('should handle server errors', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      User.findOne.mockRejectedValue(new Error('Database error'));

      await authController.login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error'
      });
    });
  });

  describe('requestPasswordReset', () => {
    it('should request password reset successfully', async () => {
      const mockUser = {
        _id: 'user1',
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue()
      };

      mockReq.body = { email: 'test@example.com' };

      User.findOne.mockResolvedValue(mockUser);
      crypto.randomBytes.mockReturnValue({ toString: jest.fn().mockReturnValue('reset-token') });
      bcrypt.hash.mockResolvedValue('hashed-reset-token');
      
      // Mock EmailService
      const mockEmailService = {
        sendPasswordResetEmail: jest.fn().mockResolvedValue(true)
      };
      EmailService.mockImplementation(() => mockEmailService);

      await authController.requestPasswordReset(mockReq, mockRes);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect(bcrypt.hash).toHaveBeenCalledWith('reset-token', 10);
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Password reset email sent successfully'
      });
    });

    it('should return error when user not found', async () => {
      mockReq.body = { email: 'nonexistent@example.com' };

      User.findOne.mockResolvedValue(null);

      await authController.requestPasswordReset(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'User not found'
      });
    });

    it('should handle server errors', async () => {
      mockReq.body = { email: 'test@example.com' };

      User.findOne.mockRejectedValue(new Error('Database error'));

      await authController.requestPasswordReset(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error'
      });
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockUser = {
        _id: 'user1',
        resetToken: 'hashed-reset-token',
        save: jest.fn().mockResolvedValue()
      };

      mockReq.body = {
        token: 'reset-token',
        newPassword: 'newpassword123'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('new-hashed-password');

      await authController.resetPassword(mockReq, mockRes);

      // Check that User.findOne was called with the correct structure, not exact timestamp
      expect(User.findOne).toHaveBeenCalledWith({
        resetTokenExpiry: { $gt: expect.any(Number) }
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('reset-token', 'hashed-reset-token');
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Password reset successful'
      });
    });

    it('should return error when user not found', async () => {
      mockReq.body = {
        token: 'reset-token',
        newPassword: 'newpassword123'
      };

      User.findOne.mockResolvedValue(null);

      await authController.resetPassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid or expired reset token'
      });
    });

    it('should return error when token is invalid', async () => {
      const mockUser = {
        _id: 'user1',
        resetToken: 'hashed-reset-token'
      };

      mockReq.body = {
        token: 'wrong-token',
        newPassword: 'newpassword123'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await authController.resetPassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid reset token'
      });
    });

    it('should handle server errors', async () => {
      mockReq.body = {
        token: 'reset-token',
        newPassword: 'newpassword123'
      };

      User.findOne.mockRejectedValue(new Error('Database error'));

      await authController.resetPassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error'
      });
    });
  });
});
