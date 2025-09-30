const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createProject, getProjects, getProjectsByDepartment, updateProject, addCollaborators, removeCollaborators, setStatusProject } = require('../controllers/projectController');

router.post('/', authMiddleware, createProject);
router.get('/', authMiddleware, getProjects);
router.get('/department/:departmentId', authMiddleware, getProjectsByDepartment);
router.patch('/:projectId/archive', authMiddleware, setStatusProject);
router.put('/:projectId', authMiddleware, updateProject);
router.post('/:projectId/collaborators', authMiddleware, addCollaborators);
router.delete('/:projectId/collaborators', authMiddleware, removeCollaborators);

module.exports = router;