const UserRepository = require('../repositories/UserRepository');
const User = require('../domain/User');

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async getUserById(userId) {
    try {
      const userDoc = await this.userRepository.findPublicById(userId);
      if (!userDoc) throw new Error('User not found');
      
      return new User(userDoc);
    } catch (error) {
      throw new Error('Error fetching user');
    }
  }

  async getUserByEmail(email) {
    try {
      const userDoc = await this.userRepository.findByEmail(email);
      if (!userDoc) throw new Error('User not found');
      
      return new User(userDoc);
    } catch (error) {
      throw new Error('Error fetching user by email');
    }
  }

  async createUser(userData) {
    try {
      const userDoc = await this.userRepository.create(userData);
      return new User(userDoc);
    } catch (error) {
      throw new Error('Error creating user');
    }
  }

  async updateUser(userId, updates) {
    try {
      const userDoc = await this.userRepository.updateById(userId, updates);
      if (!userDoc) throw new Error('User not found');
      
      return new User(userDoc);
    } catch (error) {
      throw new Error('Error updating user');
    }
  }

  async getUsersByDepartment(departmentId) {
    try {
      const userDocs = await this.userRepository.findUsersByDepartment(departmentId);
      return userDocs.map(doc => new User(doc));
    } catch (error) {
      throw new Error('Error fetching users by department');
    }
  }

  async getUsersByTeam(teamId) {
    try {
      const userDocs = await this.userRepository.findUsersByTeam(teamId);
      return userDocs.map(doc => new User(doc));
    } catch (error) {
      throw new Error('Error fetching users by team');
    }
  }

  async updatePassword(userId, passwordHash) {
    try {
      const userDoc = await this.userRepository.updatePasswordHash(userId, passwordHash);
      if (!userDoc) throw new Error('User not found');
      
      return new User(userDoc);
    } catch (error) {
      throw new Error('Error updating password');
    }
  }

  async setResetToken(userId, token, expiry) {
    try {
      const userDoc = await this.userRepository.setResetToken(userId, token, expiry);
      if (!userDoc) throw new Error('User not found');
      
      return new User(userDoc);
    } catch (error) {
      throw new Error('Error setting reset token');
    }
  }

  async clearResetToken(userId) {
    try {
      const userDoc = await this.userRepository.clearResetToken(userId);
      if (!userDoc) throw new Error('User not found');
      
      return new User(userDoc);
    } catch (error) {
      throw new Error('Error clearing reset token');
    }
  }

  async getUserByResetToken(token) {
    try {
      const userDoc = await this.userRepository.findByResetToken(token);
      if (!userDoc) throw new Error('Invalid or expired reset token');
      
      return new User(userDoc);
    } catch (error) {
      throw new Error('Error validating reset token');
    }
  }
}

// Create singleton instance
const userRepository = new UserRepository();
const userService = new UserService(userRepository);

module.exports = userService;