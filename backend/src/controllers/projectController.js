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

    const project = await ProjectService.createProject(req.body, userId);

    res.json({
      status: "success",
      data: project.toDTO() 
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message
    });
  }
};

const updateProject = async (req, res) => {
  const { projectId } = req.params;
  const updateData = req.body;

  const userId = req.user.userId;

  try {
    const updatedProject = await ProjectService.updateProject(projectId, updateData, userId);
    res.status(200).json({ 
      status: "success",
      data: updatedProject.toDTO() 
    });
  } catch (error) {
    res.status(400).json({ 
      status: "error",
      message: error.message 
    });
  }
};

const addCollaborators = async (req, res) => {
  const { projectId } = req.params;
  const { collaboratorId } = req.body; 

  const userId = req.user.userId;

  try {
    const updatedProject = await ProjectService.addCollaborator(projectId, collaboratorId, userId);
    res.status(200).json({ 
      status: "success",
      data: updatedProject.toDTO() 
    });
  } catch (error) {
    res.status(400).json({ 
      status: "error",
      message: error.message 
    });
  }
};

const removeCollaborators = async (req, res) => {
  const { projectId } = req.params;
  const { collaboratorId } = req.body; 

  const userId = req.user.userId;

  try {
    const updatedProject = await ProjectService.removeCollaborator(projectId, collaboratorId, userId);
    res.status(200).json({ 
      status: "success",
      data: updatedProject.toDTO() 
    });
  } catch (error) {
    res.status(400).json({ 
      status: "error",
      message: error.message 
    });
  }
};

const getProjects = async (req, res) => {
  try{
    const userId = req.user.userId;
    const projects = await ProjectService.getVisibleProjectsForUser(userId);

    res.json({
      status: "success",
      data: projects,
      message: "Project data is successfully retrieved"
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message
    });
  }
}

const getProjectsByDepartment = async (req, res) => {
  try{
    const { departmentId } = req.params;
    const projects = await ProjectService.getProjectsByDepartment(departmentId);

    res.json({
      status: "success",
      data: projects,
      message: "Project data is successfully retrieved"
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message
    });
  }
}

const setStatusProject = async (req, res) => {
  const { projectId } = req.params;
  const updateData = req.body;

  const userId = req.user.userId;

  try {
    const updatedProject = await ProjectService.updateProject(projectId, updateData, userId);
    res.status(200).json({ 
      status: "success",
      data: updatedProject.toDTO() 
    });
  } catch (error) {
    res.status(400).json({ 
      status: "error",
      message: error.message 
    });
  }
}
async function getProjectProgress(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id; // works with either shape
    const stats = await projectService.getProjectProgress(req.params.projectId, userId);
    res.json(stats); // { total, unassigned, ongoing, under_review, completed, percent }
  } catch (err) {
    next(err);
  }
}
;

module.exports = {
  createProject,
  getProjects,
  getProjectsByDepartment,
  updateProject,
  addCollaborators,
  removeCollaborators,
  setStatusProject,
  getProjectProgress
};
