const organizationService = require('../services/organizationService');
const UserRepository = require('../repositories/UserRepository');
const UserDomain = require('../domain/User');
const { hasAnyRole } = require('../middleware/roleMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHelper');
const { ForbiddenError } = require('../utils/errors');

const checkUserRole = async (userId, allowedRoles) => {
  const userRepository = new UserRepository();
  const userDoc = await userRepository.findById(userId);
  if (!userDoc) {
    throw new ForbiddenError('User not found');
  }
  const user = new UserDomain(userDoc);
  if (!hasAnyRole(user, allowedRoles)) {
    throw new ForbiddenError('Insufficient permissions');
  }
  return user;
};

const getAllDepartments = asyncHandler(async (req, res) => {
  await checkUserRole(req.user.userId, ['sm', 'hr']);
  const departments = await organizationService.getAllDepartments();
  sendSuccess(res, departments);
});

const getTeamsByDepartment = asyncHandler(async (req, res) => {
  const user = await checkUserRole(req.user.userId, ['director', 'manager', 'sm', 'hr']);
  const { departmentId } = req.params;

  if (hasAnyRole(user, ['director']) && user.departmentId && user.departmentId.toString() !== departmentId) {
    const teams = await organizationService.getTeamsByDepartment(departmentId);
    if (teams.length > 0) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied: You can only access your own department'
      });
    }
  }

  const teams = await organizationService.getTeamsByDepartment(departmentId);
  sendSuccess(res, teams);
});

const getAllTeams = asyncHandler(async (req, res) => {
  await checkUserRole(req.user.userId, ['sm', 'hr']);
  const teams = await organizationService.getAllTeams();
  sendSuccess(res, teams);
});

module.exports = {
  getAllDepartments,
  getTeamsByDepartment,
  getAllTeams
};
