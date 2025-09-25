const request = require('supertest');
const { describe, it, expect, beforeAll, beforeEach, afterAll, afterEach } = require('@jest/globals');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { User, Project } = require('../../src/db/models');
const { generateToken } = require('../../src/services/authService');

// --- From projectCreation.test.js ---
describe('Project Creation', () => {
  let authToken;
  let staffUser;

  beforeEach(async () => {
    staffUser = await User.findOne({ email: 'staff@example.com' });
    if (staffUser) {
      authToken = generateToken(staffUser._id);
    }
  });

  describe('POST /api/projects', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/projects/')
        .send({ name: 'Test Project' });
        
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('No token provided');
    });

    it('should create a project successfully with all fields', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Full Project',
          description: 'Testing all fields',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          collaborators: [staffUser._id]
        });
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should create a project without optional fields', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Minimal Project' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should fail if name is missing', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Missing name' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toMatch(/name is required/i);
    });

    it('should fail if deadline is invalid', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Invalid Deadline', deadline: 'invalid-date' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toMatch(/invalid date/i);
    });
  });

  //Testing for GET Project
  describe('GET /api/projects', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/projects/');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('No token provided');
    });

    it('should return all projects successfully for authenticated user', async () => {
      const response = await request(app)
        .get('/api/projects/')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});

// --- From projectManagement.test.js ---
describe('Project Management', () => {
  let authToken;
  let staffUser;
  let managerUser;
  let hrUser;
  let collaborator;
  let project;
  let originalProjectName;

  beforeAll(async () => {
    staffUser = await User.findOne({ email: 'staff@example.com' });
    managerUser = await User.findOne({ email: 'manager@example.com' });
    hrUser = await User.findOne({ email: 'hr@example.com' });
    // Prefer a staff-owned seeded project for authorization-dependent tests
    project = await Project.findOne({ name: 'Staff Sandbox Project' });
    if (!project) {
      project = await Project.findOne({ name: 'Website Revamp' });
    }

    if (!staffUser || !managerUser) {
      throw new Error('Required users not found in DB');
    }

    authToken = generateToken(staffUser._id);
    collaborator = managerUser._id;
    originalProjectName = project ? project.name : undefined;
  });

  afterAll(async () => {
      if (project) {
        await Project.findByIdAndUpdate(project._id, {
          name: originalProjectName,
          collaborators: [project.ownerId],
          isArchived: false,
        });
      }
  });

  // --- Project Update Tests ---
  describe('PUT /api/projects/:projectId', () => {
    it('should update project name and description', async () => {
      const res = await request(app)
        .put(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Project', description: 'Updated desc' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Project');
      expect(res.body.data.description).toBe('Updated desc');
    });

    it('should merge collaborators when updating collaborators array', async () => {
      const res = await request(app)
        .put(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ collaborators: [collaborator] });

      expect(res.status).toBe(200);
      expect(res.body.data.collaborators).toContain(project.ownerId.toString());
      expect(res.body.data.collaborators).toContain(collaborator.toString());
    });
  });

  describe('PUT /api/projects/:projectId permission checks', () => {
    it('should not allow HR to update project', async () => {
      const hrToken = generateToken(hrUser._id);

      const res = await request(app)
        .put(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ name: 'Illegal Update' });

      expect(res.status).toBe(400); 
      expect(res.body.message).toMatch(/not authorized/i);
    });

    it('should allow manager to update project', async () => {
      const managerToken = generateToken(managerUser._id);

      const res = await request(app)
        .put(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ name: 'Manager Update' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Manager Update');
    });
  });

  // --- Add Collaborator Tests ---
  describe('POST /api/projects/:projectId/collaborators', () => {
    it('should add a new collaborator', async () => {

      const res = await request(app)
        .post(`/api/projects/${project._id}/collaborators`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ collaboratorId: collaborator });

      expect(res.status).toBe(200);
      expect(res.body.data.collaborators).toContain(project.ownerId.toString());
      expect(res.body.data.collaborators).toContain(managerUser._id.toString());
    });

    it('should not duplicate collaborators', async () => {
      const res = await request(app)
        .post(`/api/projects/${project._id}/collaborators`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ collaboratorId: collaborator });

      expect(res.status).toBe(200);
      const collabs = res.body.data.collaborators.filter(id => id === collaborator.toString());
      expect(collabs.length).toBe(1);
    });

    // it('should return 400 if collaborator is from a different department', async () => {
    //   const otherDeptUser = await User.create({ 
    //     name: 'Other Dept', 
    //     email: `other${Date.now()}@test.com`, 
    //     departmentId: new mongoose.Types.ObjectId() 
    //   });

    //   const res = await request(app)
    //     .post(`/api/projects/${project._id}/collaborators`)
    //     .set('Authorization', `Bearer ${authToken}`)
    //     .send({ collaboratorId: otherDeptUser._id });

    //   expect(res.status).toBe(400);
    //   expect(res.body.message).toMatch(/department/i);
    // });
  });

  describe('PATCH /api/projects/:projectId/archive', () => {
    it('should archive the project', async () => {
      const res = await request(app)
        .patch(`/api/projects/${project._id}/archive`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isArchived: true });

      expect(res.status).toBe(200);
      expect(res.body.data.isArchived).toBe(true);
    });

    it('should unarchive the project', async () => {
      const res = await request(app)
        .patch(`/api/projects/${project._id}/archive`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isArchived: false });

      expect(res.status).toBe(200);
      expect(res.body.data.isArchived).toBe(false);
    });
  });

  // --- Archive / Restore Permission Test ---
  describe('PATCH /api/projects/:projectId/archive permission checks', () => {
    it('should not allow HR to archive the project', async () => {
      const hrToken = generateToken(hrUser._id);

      const res = await request(app)
        .patch(`/api/projects/${project._id}/archive`)
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ isArchived: true });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/not authorized/i);
    });

    it('should allow manager to archive the project', async () => {
      const managerToken = generateToken(managerUser._id);

      const res = await request(app)
        .patch(`/api/projects/${project._id}/archive`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ isArchived: true });

      expect(res.status).toBe(200);
      expect(res.body.data.isArchived).toBe(true);
    });
  });

  // --- Remove Collaborator Tests ---
  describe('DELETE /api/projects/:projectId/collaborators', () => {
    it('should remove a collaborator successfully', async () => {
      const res = await request(app)
        .delete(`/api/projects/${project._id}/collaborators`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ collaboratorId: managerUser._id });

      expect(res.status).toBe(200);
      expect(res.body.data.collaborators).not.toContain(managerUser._id.toString());
      expect(res.body.data.collaborators).toContain(staffUser._id.toString()); // owner still present
    });

    it('should not allow removing the project owner', async () => {
      const res = await request(app)
        .delete(`/api/projects/${project._id}/collaborators`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ collaboratorId: staffUser._id });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/cannot remove project owner/i);
    });

    it('should return error if collaborator does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/projects/${project._id}/collaborators`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ collaboratorId: fakeId });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/collaborator not found/i);
    });
  });
});


