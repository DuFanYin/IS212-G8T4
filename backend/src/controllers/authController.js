const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User } = require('../db/models');
const EmailService = require('../services/emailService');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email address'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      status: 'success',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const registerWithInvitation = async (req, res) => {
  try {
    const { token, name, password } = req.body;

    // Validate required fields
    if (!token || !name || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Invitation token, name, and password are required'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters long'
      });
    }

    // TODO: In a real implementation, you would:
    // 1. Look up the invitation token in your database
    // 2. Verify it hasn't expired
    // 3. Get the role, department, and team information from the invitation
    // 4. Create the user with that information
    // 5. Mark the invitation as used

    // For now, we'll create a basic user with staff role
    // In production, you'd validate the token and get the actual invitation data
    
    // Check if user already exists (by email from invitation)
    // This would need to be implemented based on your invitation storage
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user data
    const userData = {
      name: name.trim(),
      email: 'temp@example.com', // This would come from the invitation
      passwordHash,
      role: 'staff' // This would come from the invitation
    };

    // Create user
    const user = await User.create(userData);

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Registration with invitation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);
    
    // Save reset token and expiry
    user.resetToken = hashedToken;
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour validity
    await user.save();

    // Send password reset email
    try {
      const emailService = new EmailService();
      await emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to send password reset email'
      });
    }

    res.json({
      status: 'success',
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const user = await User.findOne({
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired reset token'
      });
    }

    // Verify token
    const isValidToken = await bcrypt.compare(token, user.resetToken);
    if (!isValidToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid reset token'
      });
    }

    // Update password
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({
      status: 'success',
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  login,
  registerWithInvitation,
  requestPasswordReset,
  resetPassword
};
