const Department = require('../db/models/Department');
const Team = require('../db/models/Team');
const User = require('../db/models/User');

// Get all departments (for SM users)
const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({})
      .populate('directorId', 'name email')
      .select('name description directorId createdAt updatedAt');
    
    const departmentsWithStats = await Promise.all(
      departments.map(async (dept) => {
        const teamCount = await Team.countDocuments({ departmentId: dept._id });
        const userCount = await User.countDocuments({ departmentId: dept._id });
        
        return {
          id: dept._id,
          name: dept.name,
          description: dept.description,
          directorId: dept.directorId?._id,
          directorName: dept.directorId?.name,
          teamCount,
          userCount,
          createdAt: dept.createdAt,
          updatedAt: dept.updatedAt
        };
      })
    );

    res.json({
      status: 'success',
      data: departmentsWithStats
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
    
    const teams = await Team.find({ departmentId })
      .populate('managerId', 'name email')
      .select('name description managerId createdAt updatedAt');
    
    const teamsWithStats = await Promise.all(
      teams.map(async (team) => {
        const userCount = await User.countDocuments({ teamId: team._id });
        
        return {
          id: team._id,
          name: team.name,
          description: team.description,
          departmentId: team.departmentId,
          managerId: team.managerId?._id,
          managerName: team.managerId?.name,
          userCount,
          createdAt: team.createdAt,
          updatedAt: team.updatedAt
        };
      })
    );

    res.json({
      status: 'success',
      data: teamsWithStats
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
    const teams = await Team.find({})
      .populate('managerId', 'name email')
      .populate('departmentId', 'name')
      .select('name description managerId departmentId createdAt updatedAt');
    
    const teamsWithStats = await Promise.all(
      teams.map(async (team) => {
        const userCount = await User.countDocuments({ teamId: team._id });
        
        return {
          id: team._id,
          name: team.name,
          description: team.description,
          departmentId: team.departmentId._id,
          departmentName: team.departmentId.name,
          managerId: team.managerId?._id,
          managerName: team.managerId?.name,
          userCount,
          createdAt: team.createdAt,
          updatedAt: team.updatedAt
        };
      })
    );

    res.json({
      status: 'success',
      data: teamsWithStats
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
