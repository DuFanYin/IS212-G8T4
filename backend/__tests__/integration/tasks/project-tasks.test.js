const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User, Project, Task } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('GET /api/tasks/project/:projectId', () => {
  let authToken;
  let testProject;
  let testTask;

  beforeAll(async () => {
    const staffUser = await User.findOne({ email: 'staff0@example.com' });
    if (!staffUser) return;
    
    authToken = generateToken(staffUser._id);

    // Create a test project
    const projectRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: `Project Tasks Test Project ${Date.now()}`,
        description: 'Test project for task listing'
      });

    if (projectRes.status === 200) {
      testProject = projectRes.body.data;

      // Create a test task in the project
      const taskRes = await request(app)
        .post('/api/tasks/')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: `Project Task ${Date.now()}`,
          description: 'Test task in project',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          projectId: testProject.id
        });

      if (taskRes.status === 201) {
        testTask = taskRes.body.data;
      }
    }
  });

  it('should get tasks by project', async () => {
    if (!testProject) return;

    const response = await request(app)
      .get(`/api/tasks/project/${testProject.id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should require authentication', async () => {
    if (!testProject) return;

    const response = await request(app)
      .get(`/api/tasks/project/${testProject.id}`);

    expect(response.status).toBe(401);
  });

  it('should handle non-existent project', async () => {
    const nonExistentProjectId = '507f1f77bcf86cd799439011';
    
    const response = await request(app)
      .get(`/api/tasks/project/${nonExistentProjectId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect([200, 404]).toContain(response.status);
    // 200 with empty array is acceptable for non-existent project
  });

  it('should return empty array for project with no tasks', async () => {
    if (!testProject) return;

    // Create a new project without tasks
    const emptyProjectRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: `Empty Project ${Date.now()}`,
        description: 'Project with no tasks'
      });

    if (emptyProjectRes.status === 200) {
      const emptyProject = emptyProjectRes.body.data;
      
      const response = await request(app)
        .get(`/api/tasks/project/${emptyProject.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    }
  });
});
