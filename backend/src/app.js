const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/logs', require('./routes/logs.route'));
app.use('/api/metrics', require('./routes/metricsRoutes'));


// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const subtaskRoutes = require('./routes/subtaskRoutes');
const taskRoutes = require('./routes/taskRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tasks', subtaskRoutes); // Mount subtask routes under tasks
app.use('/api/organization', organizationRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

module.exports = app;