const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createProject, getProjects } = require('../controllers/projectController');

router.post('/create', authMiddleware, createProject);
router.get('/projects', authMiddleware, getProjects);
router.put('/:projectId', authMiddleware, projectController.updateProject);
router.post('/:projectId/collaborators', authMiddleware, projectController.addCollaborators);

module.exports = router;