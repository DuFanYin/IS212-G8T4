const DepartmentRepository = require('../repositories/DepartmentRepository');
const TeamRepository = require('../repositories/TeamRepository');
const UserRepository = require('../repositories/UserRepository');

class OrganizationService {
  constructor(departmentRepository, teamRepository, userRepository) {
    this.departmentRepository = departmentRepository;
    this.teamRepository = teamRepository;
    this.userRepository = userRepository;
  }

  /**
   * Get all departments with statistics
   * @returns {Promise<Array>} Array of departments with team and user counts
   */
  async getAllDepartments() {
    try {
      const departments = await this.departmentRepository.findAll();
      
      const departmentsWithStats = await Promise.all(
        departments.map(async (dept) => {
          const teamCount = await this.teamRepository.findByDepartment(dept._id).then(teams => teams.length);
          const userCount = await this.userRepository.findUsersByDepartment(dept._id).then(users => users.length);
          
          return {
            id: dept._id,
            name: dept.name,
            description: dept.description,
            directorId: dept.directorId,
            directorName: dept.directorId?.name,
            teamCount,
            userCount,
            createdAt: dept.createdAt,
            updatedAt: dept.updatedAt
          };
        })
      );

      return departmentsWithStats;
    } catch (error) {
      throw new Error(`Error fetching departments: ${error.message}`);
    }
  }

  /**
   * Get teams by department with statistics
   * @param {string} departmentId - Department ID
   * @returns {Promise<Array>} Array of teams with user counts
   */
  async getTeamsByDepartment(departmentId) {
    try {
      const teams = await this.teamRepository.findByDepartment(departmentId);
      
      const teamsWithStats = await Promise.all(
        teams.map(async (team) => {
          const userCount = await this.userRepository.findUsersByTeam(team._id).then(users => users.length);
          
          return {
            id: team._id,
            name: team.name,
            description: team.description,
            departmentId: team.departmentId,
            managerId: team.managerId,
            managerName: team.managerId?.name,
            userCount,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt
          };
        })
      );

      return teamsWithStats;
    } catch (error) {
      throw new Error(`Error fetching teams for department: ${error.message}`);
    }
  }

  /**
   * Get all teams with statistics
   * @returns {Promise<Array>} Array of teams with department and user counts
   */
  async getAllTeams() {
    try {
      const teams = await this.teamRepository.findAll();
      
      const teamsWithStats = await Promise.all(
        teams.map(async (team) => {
          const userCount = await this.userRepository.findUsersByTeam(team._id).then(users => users.length);
          
          return {
            id: team._id,
            name: team.name,
            description: team.description,
            departmentId: team.departmentId,
            departmentName: team.departmentId?.name,
            managerId: team.managerId,
            managerName: team.managerId?.name,
            userCount,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt
          };
        })
      );

      return teamsWithStats;
    } catch (error) {
      throw new Error(`Error fetching all teams: ${error.message}`);
    }
  }

  /**
   * Get department by ID
   * @param {string} departmentId - Department ID
   * @returns {Promise<Object>} Department object
   */
  async getDepartmentById(departmentId) {
    try {
      const department = await this.departmentRepository.findById(departmentId);
      if (!department) {
        throw new Error('Department not found');
      }
      return department;
    } catch (error) {
      throw new Error(`Error fetching department: ${error.message}`);
    }
  }

  /**
   * Get team by ID
   * @param {string} teamId - Team ID
   * @returns {Promise<Object>} Team object
   */
  async getTeamById(teamId) {
    try {
      const team = await this.teamRepository.findById(teamId);
      if (!team) {
        throw new Error('Team not found');
      }
      return team;
    } catch (error) {
      throw new Error(`Error fetching team: ${error.message}`);
    }
  }
}

// Create singleton instance
const departmentRepository = new DepartmentRepository();
const teamRepository = new TeamRepository();
const userRepository = new UserRepository();
const organizationService = new OrganizationService(departmentRepository, teamRepository, userRepository);

module.exports = organizationService;
