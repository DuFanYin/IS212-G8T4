const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../src/app');
const { User, Task, Subtask } = require('../../src/db/models');
const { generateToken } = require('../../src/services/authService');

describe('Subtask Routes', () => {
    let authToken;
    let staffUser;
    let parentTaskID;
    let subtaskID;

    beforeAll(async () => {
        // Grab a staff user from seeded DB
        staffUser = await User.findOne({ email: 'manager@example.com' });
        if (!staffUser) throw new Error('Seeded staff user not found');

        authToken = generateToken(staffUser._id);

        // Grab a task
        const task = await Task.findOne();
        parentTaskID = task._id.toString();

        // Grab a subtask
        const subtask = await Subtask.findOne({ parentTaskId: parentTaskID });
        console.log(subtask);
        subtaskID = subtask ? subtask._id.toString() : "68d0f55ef29fab09b83a9d3c";
    });

    it('should get subtasks by parent task', async () => {
        const response = await request(app)
            .get(`/api/tasks/${parentTaskID}/subtasks`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get a single subtask by id', async () => {
        const response = await request(app)
            .get(`/api/subtasks/${subtaskID}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data).toEqual(
            expect.objectContaining({
                id: subtaskID.toString(),
                title: expect.any(String)
            })
        );
    });

    it('should create a subtask under a parent task', async () => {
        const newSubtask = {
            title: 'New Subtask',
            description: 'Test subtask creation',
            dueDate: new Date().toISOString(),
            status: 'unassigned',
            assigneeId: staffUser._id,
            collaborators: [staffUser._id], // must be subset of parent task collaborators
        };

        const response = await request(app)
            .post(`/api/tasks/${parentTaskID}/subtasks`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(newSubtask);

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.data).toEqual(
            expect.objectContaining({
                title: newSubtask.title,
                description: newSubtask.description,
            })
        );
    });

    it('should update a subtask', async () => {
        const response = await request(app)
            .put(`/api/subtasks/${subtaskID}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                title: 'Updated Title from Test',
            });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.title).toBe('Updated Title from Test');
    });

    it('should update a subtask status', async () => {
        const response = await request(app)
            .patch(`/api/subtasks/${subtaskID}/status`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ status: 'ongoing' });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.status).toBe('ongoing');
    });

    it('should soft delete a subtask', async () => {
        const response = await request(app)
            .delete(`/api/subtasks/${subtaskID}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.isDeleted).toBe(true);
    });
});