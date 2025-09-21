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
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};

const updateProject = async (req, res) => {
  const { projectId } = req.params;
  const updateData = req.body;

  try {
    const updatedProject = await ProjectService.updateProject(projectId, updateData);
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

  try {
    const updatedProject = await ProjectService.addCollaborator(projectId, collaboratorId);
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

const setStatusProject = async (req, res) => {
  const { projectId } = req.params;
  const updateData = req.body;

  try {
    const updatedProject = await ProjectService.updateProject(projectId, updateData);
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

module.exports = {
  createProject,
  getProjects,
  updateProject,
  addCollaborators,
  setStatusProject
};
