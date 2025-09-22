const request = require('supertest');
const { describe, it, expect, beforeAll, beforeEach, afterEach } = require('@jest/globals');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { Project, User } = require('../../src/db/models');
const { generateToken } = require('../../src/services/authService');

describe('Project Management', () => {
  let authToken;
  let staffUser;
  let managerUser;
  let hrUser;
  let collaborator;
  let project;

  // Ensure seed project exists
  beforeAll(async () => {
    staffUser = await User.findOne({ email: 'staff@example.com' });
    managerUser = await User.findOne({ email: 'manager@example.com' });
    hrUser = await User.findOne({ email: 'hr@example.com' });
    project = await Project.findOne({ name: 'Manager Update'});

    if (!staffUser || !managerUser) {
      throw new Error('Required users not found in DB');
    }

    authToken = generateToken(staffUser._id);
    collaborator = managerUser._id;
  });

    afterAll(async () => {
        if (project) {
            await Project.findByIdAndUpdate(project._id, {
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
});
