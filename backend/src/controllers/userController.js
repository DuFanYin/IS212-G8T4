const userService = require('../services/userService');
const User = require('../domain/User');

const getProfile = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        departmentId: user.departmentId
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const getTeamMembers = async (req, res) => {
  try {
    const currentUser = await userService.getUserById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const user = new User(currentUser);
    
    // Only managers and above can see team members
    if (!user.canAssignTasks()) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions to view team members'
      });
    }

    let users = [];
    
    if (user.canSeeAllTasks()) {
      // HR/SM: can see all users
      const allUsers = await userService.getAllUsers();
      users = allUsers.map(u => u.toSafeDTO());
    } else if (user.canSeeDepartmentTasks()) {
      // Director: can see department users
      users = await userService.getUsersByDepartment(user.departmentId);
      users = users.map(u => u.toSafeDTO());
    } else if (user.canSeeTeamTasks()) {
      // Manager: can see team users
      users = await userService.getUsersByTeam(user.teamId);
      users = users.map(u => u.toSafeDTO());
    }

    res.json({
      status: 'success',
      data: users
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const getDepartmentMembers = async (req, res) => {
  try {
    const currentUser = await userService.getUserById(req.user.userId);
    if (!currentUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const user = new User(currentUser);
    
    // Only directors and above can see department members
    if (!user.canSeeDepartmentTasks() && !user.canSeeAllTasks()) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions to view department members'
      });
    }

    const departmentId = req.params.departmentId || user.departmentId;
    const users = await userService.getUsersByDepartment(departmentId);
    
    res.json({
      status: 'success',
      data: users.map(u => u.toSafeDTO())
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  getProfile,
  getTeamMembers,
  getDepartmentMembers
};
