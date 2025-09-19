const UserModel = require('../db/models/User');

class UserRepository {
  async findById(id) {
    return UserModel.findById(id);
  }

  async findPublicById(id) {
    return UserModel.findById(id).select('-passwordHash');
  }

  async findByEmail(email) {
    return UserModel.findOne({ email });
  }

  async findUsersByDepartment(departmentId) {
    return UserModel.find({ departmentId }).select('-passwordHash');
  }

  async findUsersByTeam(teamId) {
    return UserModel.find({ teamId }).select('-passwordHash');
  }

  async create(userData) {
    return UserModel.create(userData);
  }

  async updateById(id, updates) {
    return UserModel.findByIdAndUpdate(id, updates, { new: true });
  }

  async updatePasswordHash(id, passwordHash) {
    return UserModel.findByIdAndUpdate(id, { passwordHash }, { new: true });
  }

  async setResetToken(id, token, expiry) {
    return UserModel.findByIdAndUpdate(id, { 
      resetToken: token, 
      resetTokenExpiry: expiry 
    }, { new: true });
  }

  async clearResetToken(id) {
    return UserModel.findByIdAndUpdate(id, { 
      resetToken: null, 
      resetTokenExpiry: null 
    }, { new: true });
  }

  async findByResetToken(token) {
    return UserModel.findOne({ 
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });
  }
}

module.exports = UserRepository;