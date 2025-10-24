const request = require('supertest');
const app = require('../../../src/app');
const { User, Task } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

describe('Recurring Tasks Integration', () => {
	let managerUser;
    let authToken;
    let createdTaskId;

	beforeAll(async () => {
		managerUser = await User.findOne({ email: 'manager0@example.com' });
		authToken = generateToken(managerUser._id);
	});

	afterAll(async () => {
		await Task.deleteMany({ title: /Recurring/ });
	});

	test('should create a recurring task', async () => {
		const res = await request(app)
			.post('/api/tasks')
			.set('Authorization', `Bearer ${authToken}`)
			.send({
				title: 'Recurring Task',
				description: 'Test recurring task creation',
				dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
				recurringInterval: 1,
			});
		expect(res.status).toBe(201);
		expect(res.body.data).toHaveProperty('recurringInterval', 1);
		createdTaskId = res.body.data.id;
	});

	test('should update recurrence of a task', async () => {
		const res = await request(app)
			.put(`/api/tasks/${createdTaskId}`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({ recurringInterval: 7 });
		expect(res.status).toBe(200);
		expect(res.body.data).toHaveProperty('recurringInterval', 7);
	});

	test('should create a new recurring task when completed', async () => {

		// Complete the task
		const completeRes = await request(app)
			.patch(`/api/tasks/${createdTaskId}/status`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({ status: 'completed' });
		expect(completeRes.status).toBe(200);
		expect(completeRes.body.data).toHaveProperty('status', 'completed');

        prevDueDate = new Date(completeRes.body.data.dueDate);

		// Check for new recurring task
		const tasksRes = await request(app)
			.get('/api/tasks')
			.set('Authorization', `Bearer ${authToken}`);
		const recurringTasks = tasksRes.body.data.filter(t => t.title === 'Recurring Task' && t.status !== 'completed');
		expect(recurringTasks.length).toBeGreaterThanOrEqual(1);
		const newTask = recurringTasks[0];
		expect(newTask).toHaveProperty('recurringInterval', 7);

		// Check due date is previous due date + recurring interval (in days)
		const expectedDueDate = new Date(prevDueDate.getTime() + 7 * 24 * 60 * 60 * 1000);
		const newDueDate = new Date(newTask.dueDate);
		// Allow for up to 1 minute difference due to processing delays
		const diffMinutes = Math.abs((newDueDate - expectedDueDate) / (60 * 1000));
		expect(diffMinutes).toBeLessThanOrEqual(1);
	});
});
