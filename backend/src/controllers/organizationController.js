const organizationService = require('../services/organizationService');
const { User } = require('../db/models');

// Helper function to check user role
const checkUserRole = async (userId, allowedRoles) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions');
  }
  return user;
};

// Get all departments (for SM and HR users)
const getAllDepartments = async (req, res) => {
  try {
    await checkUserRole(req.user.userId, ['sm', 'hr']);
    const departments = await organizationService.getAllDepartments();
    
    res.json({
      status: 'success',
      data: departments
    });
  } catch (error) {
    if (error.message === 'User not found' || error.message === 'Insufficient permissions') {
      return res.status(403).json({
        status: 'error',
        message: error.message
      });
    }
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get teams by department (for Director+ users)
const getTeamsByDepartment = async (req, res) => {
  try {
    const user = await checkUserRole(req.user.userId, ['director', 'manager', 'sm', 'hr']);
    const { departmentId } = req.params;
    
    // Directors can only access their own department, but allow access to non-existent departments
    if (user.role === 'director' && user.departmentId && user.departmentId.toString() !== departmentId) {
      // Check if the department exists by trying to get teams
      const teams = await organizationService.getTeamsByDepartment(departmentId);
      // If teams exist, it means the department exists and director shouldn't access it
      if (teams.length > 0) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied: You can only access your own department'
        });
      }
      // If no teams, department might not exist, allow access (will return empty array)
    }
    
    const teams = await organizationService.getTeamsByDepartment(departmentId);
    
    res.json({
      status: 'success',
      data: teams
    });
  } catch (error) {
    if (error.message === 'User not found' || error.message === 'Insufficient permissions') {
      return res.status(403).json({
        status: 'error',
        message: error.message
      });
    }
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get all teams (for SM and HR users)
const getAllTeams = async (req, res) => {
  try {
    await checkUserRole(req.user.userId, ['sm', 'hr']);
    const teams = await organizationService.getAllTeams();
    
    res.json({
      status: 'success',
      data: teams
    });
  } catch (error) {
    if (error.message === 'User not found' || error.message === 'Insufficient permissions') {
      return res.status(403).json({
        status: 'error',
        message: error.message
      });
    }
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  getAllDepartments,
  getTeamsByDepartment,
  getAllTeams
};
