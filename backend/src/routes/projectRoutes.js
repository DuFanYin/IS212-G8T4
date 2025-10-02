const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createProject, getProjects, getProjectsByDepartment, updateProject, addCollaborators, removeCollaborators, setStatusProject } = require('../controllers/projectController');

router.post('/', authMiddleware, createProject);
router.get('/', authMiddleware, getProjects);
router.get('/departments/:departmentId', authMiddleware, getProjectsByDepartment);
router.put('/:projectId/archive', authMiddleware, setStatusProject);
router.put('/:projectId', authMiddleware, updateProject);
router.put('/:projectId/collaborators', authMiddleware, addCollaborators);
router.delete('/:projectId/collaborators', authMiddleware, removeCollaborators);

module.exports = router;