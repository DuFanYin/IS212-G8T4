const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createProject, getProjects, updateProject, addCollaborators, setStatusProject } = require('../controllers/projectController');

router.post('/', authMiddleware, createProject);
router.get('/', authMiddleware, getProjects);
router.patch('/:projectId/archive', authMiddleware, setStatusProject);
router.put('/:projectId', authMiddleware, updateProject);
router.post('/:projectId/collaborators', authMiddleware, addCollaborators);

module.exports = router;