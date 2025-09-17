const ProjectService = require('../services/projectService');

const createProject = async (req, res) => {
  try {
    const { name, description, deadline, departmentId, collaborators, isArchived, hasContainedTasks } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Name is required"
      });
    }

    const userId = req.user.id;

    await ProjectService.createProject(req.body, userId);

    res.status(201).json({
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

module.exports = {
  createProject
};
