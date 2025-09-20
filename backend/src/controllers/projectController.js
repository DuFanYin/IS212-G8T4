const ProjectService = require('../services/projectService');

const createProject = async (req, res) => {
  try {
    const { name, description, deadline, departmentId, collaborators, isArchived, hasContainedTasks, ownerId } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Name is required"
      });
    }

    if(deadline){
      const today = new Date();

      if(new Date(deadline) < today || isNaN(new Date(deadline).getTime())){
        return res.status(400).json({
          status: "error",
          message: "Invalid date"
        });
      }
    }

    const userId = req.user.userId;

    await ProjectService.createProject(req.body, userId);

    res.json({
      status: "success",
      message: "Project is successfully created"
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

const getProjects = async (req, res) => {
  try{
    const projects = await ProjectService.getProjects();

    res.json({
      status: "success",
      data: projects,
      message: "Project data is successfully retrieved"
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
}

module.exports = {
  createProject,
  getProjects
};
