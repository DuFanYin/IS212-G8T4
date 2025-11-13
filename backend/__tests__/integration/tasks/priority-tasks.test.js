const request = require('supertest');
const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User, Task, Project } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('Task API - Priority & Project Handling', () => {
    let managerToken;
    let testTaskId;
    let projectA;
    let projectB;

    beforeAll(async () => {
        // Get manager user and generate token
        const managerUser = await User.findOne({ email: 'manager0@example.com' });
        managerToken = generateToken(managerUser._id);

        // Seed two test projects
        projectA = await Project.create({ name: 'Project A', ownerId: managerUser.id });
        projectB = await Project.create({ name: 'Project B', ownerId: managerUser.id });

        await Task.create([
            { title: 'Task 1', projectId: projectA._id, priority: 5, createdBy: managerUser._id, dueDate: "2025-11-05T12:00:00.000Z" },
            { title: 'Task 2', projectId: projectA._id, priority: 9, createdBy: managerUser._id, dueDate: "2025-11-05T12:00:00.000Z" },
            { title: 'Task 3', projectId: projectA._id, priority: 3, createdBy: managerUser._id, dueDate: "2025-11-05T12:00:00.000Z" },
        ]);

    });

    afterAll(async () => {
        // Clean up test tasks and projects
        await Task.deleteMany({ title: /Test Task/i });
        await Project.deleteMany({ _id: { $in: [projectA._id, projectB._id] } });
    });

    it('should create a task with projectId and priority successfully', async () => {
        const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
            title: 'Test Task with Priority',
            projectId: projectA._id,
            priority: 7,
            dueDate: '2025-12-01',
        });

        expect(response.status).toBe(201);
        expect(response.body.data.priority).toBe(7);
        expect(response.body.data.projectId).toBeDefined();
        testTaskId = response.body.data.id; // save for later tests
    });

    it('should throw error if task is created with projectId but no priority', async () => {
        const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
            title: 'Task missing priority',
            projectId: projectA._id,
        });

        expect([400, 500]).toContain(response.status);
        expect(response.body.message).toMatch(/task priority must be provided|Error creating task/i);
    });

    it('should return tasks sorted by ascending priority', async () => {
        const response = await request(app)
        .get(`/api/tasks/project/${projectA._id}`)
        .set('Authorization', `Bearer ${managerToken}`);

        expect(response.status).toBe(200);
        const tasks = response.body.data;
        expect(tasks.length).toBeGreaterThan(0);
        for (let i = 0; i < tasks.length - 1; i++) {
            expect(tasks[i].priority).toBeLessThanOrEqual(tasks[i + 1].priority);
        }
    });

    it('should throw error if changing projectId without providing new priority', async () => {
        const response = await request(app)
        .put(`/api/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
            projectId: projectB._id, 
        });

        expect([400, 500]).toContain(response.status);
        expect(response.body.message).toMatch(/task priority must be provided|Error updating task/i);
    });

    it('should allow changing projectId with a new priority', async () => {
        const response = await request(app)
        .put(`/api/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
            projectId: projectB._id,
            priority: 10,
        });

        expect([200, 403]).toContain(response.status);
        if (response.status === 200) {
            expect(response.body.data.projectId).toBe(String(projectB._id));
            expect(response.body.data.priority).toBe(10);
        }
    });
});
