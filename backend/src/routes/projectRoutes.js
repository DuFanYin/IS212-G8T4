const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createProject, getProjects, getProjectsByDepartment, updateProject,
  addCollaborators, removeCollaborators, setStatusProject,
  getProjectProgress, getProjectStats,
  assignRole
} = require('../controllers/projectController');

router.post('/', authMiddleware, createProject);
router.get('/', authMiddleware, getProjects);
router.get('/departments/:departmentId', authMiddleware, getProjectsByDepartment);

// Progress and stats endpoints
router.get('/:projectId/progress', authMiddleware, getProjectProgress);
router.get('/:projectId/stats', authMiddleware, getProjectStats);

router.put('/:projectId/archive', authMiddleware, setStatusProject);
// Assign role to collaborator (owner only)
router.post('/:projectId/assign-role', authMiddleware, assignRole);
router.put('/:projectId', authMiddleware, updateProject);
router.put('/:projectId/collaborators', authMiddleware, addCollaborators);
router.delete('/:projectId/collaborators', authMiddleware, removeCollaborators);

module.exports = router;
