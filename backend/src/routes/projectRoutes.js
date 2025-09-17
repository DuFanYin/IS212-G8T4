const express = require('express');
const router = express.Router();
const { createProject, getProjects } = require('../controllers/projectController');

router.post('/create', createProject);
router.get('/projects', getProjects);

module.exports = router;