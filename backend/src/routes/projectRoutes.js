const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createProject,
  getProjects,
  getProjectsByDepartment,
  updateProject,
  addCollaborators,
  removeCollaborators,
  assignRole,   
  setStatusProject,
  getProjectProgress
} = require('../controllers/projectController');

// Create a new project
router.post('/', authMiddleware, createProject);

// Get all projects visible to the user
router.get('/', authMiddleware, getProjects);

// Get projects by department
router.get('/departments/:departmentId', authMiddleware, getProjectsByDepartment);

// NEW: manager/owner progress view
router.get('/:projectId/progress', authMiddleware, getProjectProgress);

// Update project details
router.put('/:projectId', authMiddleware, updateProject);

// Archive/unarchive project
router.put('/:projectId/archive', authMiddleware, setStatusProject);

// Add a collaborator
router.put('/:projectId/collaborators', authMiddleware, addCollaborators);

// Remove a collaborator
router.delete('/:projectId/collaborators', authMiddleware, removeCollaborators);

// Assign or update collaborator role
router.post('/:projectId/assign-role', authMiddleware, assignRole);

module.exports = router;
