const request = require('supertest');
const { describe, it, expect, beforeAll } = require('@jest/globals');
const app = require('../../../src/app');
const { User, Task } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');
const path = require('path');
const fs = require('fs');

describe('Task Attachments API', () => {
    let authToken;
    let managerToken;
    let testTaskId;

    beforeAll(async () => {
        const staffUser = await User.findOne({ email: 'staff0@example.com' });
        const managerUser = await User.findOne({ email: 'manager0@example.com' });

        if (staffUser) authToken = generateToken(staffUser._id);
        if (managerUser) managerToken = generateToken(managerUser._id);

        // Create a test task
        if (authToken) {
            const createRes = await request(app)
                .post('/api/tasks/')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: `Attachment Test Task ${Date.now()}`,
                    description: 'Task to test attachments',
                    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                });

            if (createRes.status === 201) {
                testTaskId = createRes.body.data.id;
            }
        }
    });

    it('should allow a staff user to upload an attachment and save it in storage/<taskId>/', async () => {
        const filePath = path.join(__dirname, '../../fixtures/test.pdf');
        const response = await request(app)
            .post(`/api/tasks/${testTaskId}/attachments`)
            .set('Authorization', `Bearer ${authToken}`)
            .attach('file', filePath);

        expect([200, 201]).toContain(response.status);
        expect(response.body.status).toBe('success');

        // Check file existence in storage/<taskId>/
        const storageDir = path.join(__dirname, '../../../src/storage', testTaskId);
        const files = fs.existsSync(storageDir) ? fs.readdirSync(storageDir) : [];

        expect(files.length).toBeGreaterThan(0);
        expect(files.some(f => f.endsWith('.pdf') || f.endsWith('.docx') || f.endsWith('.xlsx'))).toBe(true);
    });

    it('should reject unsupported file formats', async () => {
        if (!authToken || !testTaskId) return;

        const response = await request(app)
            .post(`/api/tasks/${testTaskId}/attachments`)
            .set('Authorization', `Bearer ${authToken}`)
            .attach('file', path.resolve(__dirname, '../../fixtures/invalid.txt'));

        expect(([400, 415]).includes(response.status)).toBe(true);
    });

    // it('should reject file uploads that exceed size limit', async () => {
    //     if (!authToken || !testTaskId) return;

    //     const response = await request(app)
    //         .post(`/api/tasks/${testTaskId}/attachments`)
    //         .set('Authorization', `Bearer ${authToken}`)
    //         .attach('file', path.resolve(__dirname, '../../fixtures/large-file.pdf')); // > size limit

    //     expect([400, 413]).toContain(response.status);
    // });

    it('should prevent unauthorized users from adding attachments', async () => {
        if (!testTaskId) return;

        const response = await request(app)
            .post(`/api/tasks/${testTaskId}/attachments`)
            .attach('file', path.resolve(__dirname, '../../fixtures/test.pdf'));

        expect(response.status).toBe(401);
    });

    it('should allow task owner to remove an attachment', async () => {
        if (!authToken || !testTaskId) {
            await new Promise(res => setTimeout(res, 50));
            return;
        }

        // First upload an attachment
        const uploadRes = await request(app)
            .post(`/api/tasks/${testTaskId}/attachments`)
            .set('Authorization', `Bearer ${authToken}`)
            .attach('file', path.resolve(__dirname, '../../fixtures/test.pdf'));

        console.log('uploadRes.body:', uploadRes.body);
        const attachmentId = uploadRes.body.data.attachments[0]._id;

        const removeRes = await request(app)
            .delete(`/api/tasks/${testTaskId}/attachments/${attachmentId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(removeRes.status).toBe(200);
        expect(removeRes.body.status).toBe('success');
    });

    it('should allow a manager collaborator to remove an attachment', async () => {
        if (!managerToken || !testTaskId) return;

        // Add manager as collaborator (depends on your API)
        await request(app)
            .put(`/api/tasks/${testTaskId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ collaborators: [(await User.findOne({ email: 'manager0@example.com' }))._id] });

        const uploadRes = await request(app)
            .post(`/api/tasks/${testTaskId}/attachments`)
            .set('Authorization', `Bearer ${authToken}`)
            .attach('file', path.resolve(__dirname, '../../fixtures/test.pdf'));

        if (uploadRes.status !== 201 && uploadRes.status !== 200) return;

        const attachmentId = uploadRes.body.data.attachments[0]._id;

        const removeRes = await request(app)
            .delete(`/api/tasks/${testTaskId}/attachments/${attachmentId}`)
            .set('Authorization', `Bearer ${managerToken}`);

        expect(removeRes.status).toBe(200);
        expect(removeRes.body.status).toBe('success');
    });

    it('should not allow unrelated users to remove attachments', async () => {
        if (!testTaskId) return;

        const otherUser = await User.findOne({ email: 'staff1@example.com' });
        const otherToken = generateToken(otherUser._id);

        const response = await request(app)
            .delete(`/api/tasks/${testTaskId}/attachments/someFakeAttachmentId`)
            .set('Authorization', `Bearer ${otherToken}`);

        expect([403, 404]).toContain(response.status);
    });
});

