const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('Project collaborators', () => {
  let authToken;
  let staffUser;
  let managerUser;
  let project;

  beforeAll(async () => {
    staffUser = await User.findOne({ email: 'staff0@example.com' });
    managerUser = await User.findOne({ email: 'manager0@example.com' });
    authToken = generateToken(staffUser._id);
    // Create a fresh project owned by staff to ensure predictable permissions/state
    const createRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: `Collab Test Project ${Date.now()}`, description: 'temp' });
    project = createRes.body.data;
  });

  it('should add a new collaborator', async () => {
    const projectId = project.id || project._id;
    const res = await request(app)
      .put(`/api/projects/${projectId}/collaborators`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ collaboratorId: managerUser._id });

    expect(res.status).toBe(200);
    // Check that owner is in collaborators (as editor)
    const ownerInCollaborators = res.body.data.collaborators.some(collab => 
      collab.user === project.ownerId.toString() && collab.role === 'editor'
    );
    expect(ownerInCollaborators).toBe(true);
    
    // Check that manager is in collaborators (as viewer)
    const managerInCollaborators = res.body.data.collaborators.some(collab => 
      collab.user === managerUser._id.toString() && collab.role === 'viewer'
    );
    expect(managerInCollaborators).toBe(true);
  });

  it('should not duplicate collaborators', async () => {
    const projectId = project.id || project._id;
    const res = await request(app)
      .put(`/api/projects/${projectId}/collaborators`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ collaboratorId: managerUser._id });

    expect(res.status).toBe(200);
    const managerCollaborators = res.body.data.collaborators.filter(collab => 
      collab.user === managerUser._id.toString()
    );
    expect(managerCollaborators.length).toBe(1);
  });

  it('should remove a collaborator successfully', async () => {
    const projectId = project.id || project._id;
    const res = await request(app)
      .delete(`/api/projects/${projectId}/collaborators`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ collaboratorId: managerUser._id });

    expect(res.status).toBe(200);
    // Check that manager is not in collaborators anymore
    const managerInCollaborators = res.body.data.collaborators.some(collab => 
      collab.user === managerUser._id.toString()
    );
    expect(managerInCollaborators).toBe(false);
    
    // Check that owner is still in collaborators
    const ownerInCollaborators = res.body.data.collaborators.some(collab => 
      collab.user === staffUser._id.toString()
    );
    expect(ownerInCollaborators).toBe(true);
  });

  it('should not allow removing the project owner', async () => {
    const projectId = project.id || project._id;
    const res = await request(app)
      .delete(`/api/projects/${projectId}/collaborators`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ collaboratorId: staffUser._id });

    expect(res.status).toBe(400);
    // Message may vary; ensure authorization error is returned
    expect(typeof res.body.message).toBe('string');
  });
});


