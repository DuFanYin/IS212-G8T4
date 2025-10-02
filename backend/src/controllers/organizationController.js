const organizationService = require('../services/organizationService');

// Get all departments (for SM users)
const getAllDepartments = async (req, res) => {
  try {
    const departments = await organizationService.getAllDepartments();
    
    res.json({
      status: 'success',
      data: departments
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get teams by department (for Director users)
const getTeamsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const teams = await organizationService.getTeamsByDepartment(departmentId);
    
    res.json({
      status: 'success',
      data: teams
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get all teams (for SM users)
const getAllTeams = async (req, res) => {
  try {
    const teams = await organizationService.getAllTeams();
    
    res.json({
      status: 'success',
      data: teams
    });
  } catch (error) {
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
