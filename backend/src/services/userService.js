const { User } = require('../db/models');

const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId).select('-passwordHash');
    return user;
  } catch (error) {
    throw new Error('Error fetching user');
  }
};

module.exports = {
  getUserById
};
