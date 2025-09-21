const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createProject, getProjects, updateProject, addCollaborators } = require('../controllers/projectController');

router.post('/create', authMiddleware, createProject);
router.get('/projects', authMiddleware, getProjects);
router.put('/:projectId', authMiddleware, updateProject);
router.post('/:projectId/collaborators', authMiddleware, addCollaborators);

module.exports = router;