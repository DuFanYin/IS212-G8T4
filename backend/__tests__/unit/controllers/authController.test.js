jest.mock('../../../src/utils/asyncHandler', () => {
  return (fn) => fn;
});

jest.mock('../../../src/utils/responseHelper', () => ({
  sendSuccess: jest.fn((res, data, message, statusCode) => {
    const response = {
      status: 'success',
      data
    };
    if (message) response.message = message;
    return res.status(statusCode || 200).json(response);
  }),
  sendError: jest.fn(),
  sendSuccessMessage: jest.fn()
}));

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
const { sendSuccess } = require('../../../src/utils/responseHelper');

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
      expect(mockRes.status).toHaveBeenCalledWith(200);
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

    it('should throw error when email is missing', async () => {
      mockReq.body = { password: 'password123' };

      await expect(authController.login(mockReq, mockRes)).rejects.toThrow('Email and password are required');
    });

    it('should throw error when password is missing', async () => {
      mockReq.body = { email: 'test@example.com' };

      await expect(authController.login(mockReq, mockRes)).rejects.toThrow('Email and password are required');
    });

    it('should throw error for invalid email format', async () => {
      mockReq.body = {
        email: 'invalid-email',
        password: 'password123'
      };

      await expect(authController.login(mockReq, mockRes)).rejects.toThrow('Please provide a valid email address');
    });

    it('should throw error when user not found', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(null);

      await expect(authController.login(mockReq, mockRes)).rejects.toThrow('Invalid email or password');
    });

    it('should throw error when password is invalid', async () => {
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

      await expect(authController.login(mockReq, mockRes)).rejects.toThrow('Invalid email or password');
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
        data: null,
        message: 'Password reset email sent successfully'
      });
    });

    it('should throw error when user not found', async () => {
      mockReq.body = { email: 'nonexistent@example.com' };

      User.findOne.mockResolvedValue(null);

      await expect(authController.requestPasswordReset(mockReq, mockRes)).rejects.toThrow('User not found');
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

      expect(bcrypt.compare).toHaveBeenCalledWith('reset-token', 'hashed-reset-token');
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: null,
        message: 'Password reset successful'
      });
    });

    it('should throw error when user not found', async () => {
      mockReq.body = {
        token: 'reset-token',
        newPassword: 'newpassword123'
      };

      User.findOne.mockResolvedValue(null);

      await expect(authController.resetPassword(mockReq, mockRes)).rejects.toThrow('Invalid or expired reset token');
    });

    it('should throw error when token is invalid', async () => {
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

      await expect(authController.resetPassword(mockReq, mockRes)).rejects.toThrow('Invalid reset token');
    });
  });
});
