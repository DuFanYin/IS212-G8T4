const request = require('supertest');
const { describe, beforeAll, afterAll, test, expect } = require('@jest/globals');
const app = require('../../../src/app');
const { User, Task, ActivityLog } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');
const mongoose = require('mongoose');

describe('Task Activity Logging', () => {
  let managerUser, managerToken, taskId, assigneeUser;

  beforeAll(async () => {
    managerUser = await User.findOne({ email: 'manager0@example.com' });
    managerToken = generateToken(managerUser._id);

    assigneeUser = await User.findOne({ email: 'staff0@example.com' });
  });

  afterAll(async () => {
    await Task.deleteMany({ title: /Test Task/i });
    await ActivityLog.deleteMany({ taskId: taskId });
  });

  test('should create a task and log "created"', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        title: 'Test Task - Create',
        dueDate: '2025-11-05T12:00:00.000Z'
      });

    expect(res.status).toBe(201);
    taskId = res.body.data.id || res.body.data._id;

    const log = await ActivityLog.findOne({ taskId, action: 'created' });
    expect(log).toBeTruthy();
    expect(log.details.after.title).toBe('Test Task - Create');
  });

  test('should update a task and log "updated"', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ title: 'Test Task - Updated' });
    expect(res.status).toBe(200);

    const log = await ActivityLog.findOne({ taskId, action: 'updated' });
    expect(log).toBeTruthy();
    expect(log.details.after.title).toBe('Test Task - Updated');
  });

  test('should assign a task and log "assigned"', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}/assign`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ assigneeId: assigneeUser._id });

    expect(res.status).toBe(200);

    const log = await ActivityLog.findOne({ taskId, action: 'assigned' });
    expect(log).toBeTruthy();
    expect(log.details.after).toBe(assigneeUser._id.toString());
  });

  test('should update task status and log "status_changed"', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}/status`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ status: 'in_progress' });

    expect(res.status).toBe(200);

    const log = await ActivityLog.findOne({ taskId, action: 'status_changed' });
    expect(log).toBeTruthy();
    expect(log.details.after).toBe('in_progress');
  });

  test('should soft delete a task and log "status_changed"', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);

    const log = await ActivityLog.findOne({ taskId, action: 'status_changed' });
    expect(log).toBeTruthy();
    expect(log.details.after).toBeNull();
  });
});
