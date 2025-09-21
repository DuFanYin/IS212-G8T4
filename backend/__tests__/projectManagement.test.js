const request = require('supertest');
const { describe, it, expect, beforeAll, beforeEach, afterEach } = require('@jest/globals');
const mongoose = require('mongoose');
const app = require('../src/app');
const { Project, User } = require('../src/db/models');
const { generateToken } = require('../src/services/authService');

const FIXED_PROJECT_ID = '68cec5c992b198d1faa4ffea'; // your seed project

describe('Project Management', () => {
  let authToken;
  let staffUser;
  let managerUser;
  let collaborator;
  let project;

  // Ensure seed project exists
  beforeAll(async () => {
    staffUser = await User.findOne({ email: 'staff@example.com' });
    managerUser = await User.findOne({ email: 'manager@example.com' });

    if (!staffUser || !managerUser) {
      throw new Error('Required users not found in DB');
    }

    project = await Project.findById(FIXED_PROJECT_ID);

    authToken = generateToken(staffUser._id);
    collaborator = managerUser._id;
  });

    afterAll(async () => {
        if (project) {
            await Project.findByIdAndUpdate(project._id, {
                collaborators: [project.ownerId], // reset to only owner
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
      console.log(res.body);
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
});
