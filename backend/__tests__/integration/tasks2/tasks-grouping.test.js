// __tests__/integration/tasks2/tasks-grouping.test.js
const request = require('supertest');

// mock the upload middleware so requiring app doesn't pull in 'multer'
jest.mock('../../../src/middleware/attachmentMiddleware', () => ({
  uploadSingle: (req, res, next) => next(),
}));

const app = require('../../../src/app');
const { User } = require('../../../src/db/models');
const { generateToken } = require('../../../src/services/authService');

jest.setTimeout(30000);

/* ---------------- helpers ---------------- */
const data = (res) => (res && res.body && (res.body.data ?? res.body)) || {};
const idOf = (res) => {
  const d = data(res);
  return d.id || d._id;
};
const titlesFromList = (payload) => {
  const list = Array.isArray(payload) ? payload : (payload.items || []);
  return list.map((t) => t.title);
};

async function tokenFor(email) {
  const u = await User.findOne({ email });
  if (!u) throw new Error(`Seeded user not found: ${email}. Seed your TEST DB or adjust the email.`);
  return generateToken(u._id);
}

async function createProject(token, name) {
  const res = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ name });
  if (![200, 201].includes(res.status)) {
    throw new Error(`Create project failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return idOf(res);
}

async function createTask(token, { title, dueDate, status }) {
  const res = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${token}`)
    .send({ title, dueDate, status });
  if (![200, 201].includes(res.status)) {
    throw new Error(`Create task failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return idOf(res);
}

/* ---------------- tests ---------------- */
describe('Task grouping by projects/categories', () => {
  let ownerToken, managerToken, staffToken;
  let p1, p2, t1, t2, t3;
  const UNIQUE = `it-${Date.now()}`; // unique suffix to avoid collisions
  const titles = {
    t1: `Draft campaign brief ${UNIQUE}`,
    t2: `Budget v1 ${UNIQUE}`,
    t3: `Write SOP ${UNIQUE}`,
  };
  const projNames = {
    p1: `Marketing Project ${UNIQUE}`,
    p2: `Finance ${UNIQUE}`,
  };

  beforeAll(async () => {
    // use seeded accounts (password not needed because we mint tokens directly)
    ownerToken   = await tokenFor('manager0@example.com'); // project owner
    managerToken = await tokenFor('manager1@example.com'); // another manager
    staffToken   = await tokenFor('staff0@example.com');   // normal staff

    // two projects
    p1 = await createProject(ownerToken, projNames.p1);
    p2 = await createProject(ownerToken, projNames.p2);

    // three tasks (valid statuses: 'unassigned','ongoing','under_review','completed')
    t1 = await createTask(ownerToken, { title: titles.t1, dueDate: '2030-01-01', status: 'ongoing' });
    t2 = await createTask(ownerToken, { title: titles.t2, dueDate: '2030-01-02', status: 'under_review' });
    t3 = await createTask(ownerToken, { title: titles.t3, dueDate: '2030-01-03', status: 'unassigned' });
  });

  afterAll(async () => {
    // clean up the stuff we created so other test runs don’t get polluted
    await Promise.all([
      Task.deleteMany({ title: { $in: Object.values(titles) } }),
      Project.deleteMany({ name: { $in: Object.values(projNames) } }),
    ]);
  });

  it('assigns a task to multiple projects', async () => {
    const r1 = await request(app)
      .patch(`/api/tasks/${t1}/projects`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ projectIds: [p1, p2] });
    expect(r1.status).toBe(200);
    expect(data(r1).projects).toEqual(expect.arrayContaining([p1, p2]));

    const r2 = await request(app)
      .patch(`/api/tasks/${t2}/projects`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ projectIds: [p2] });
    expect(r2.status).toBe(200);
    expect(data(r2).projects).toEqual(expect.arrayContaining([p2]));
  });

  it('filters tasks by project', async () => {
    const rA = await request(app)
      .get(`/api/tasks?projectId=${p1}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(rA.status).toBe(200);
    expect(titlesFromList(data(rA))).toEqual([titles.t1]);

    const rB = await request(app)
      .get(`/api/tasks?projectId=${p2}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(rB.status).toBe(200);
    expect(new Set(titlesFromList(data(rB)))).toEqual(new Set([titles.t1, titles.t2]));
  });

  it('lists unassigned tasks', async () => {
    const r = await request(app)
      .get('/api/tasks?unassigned=true') // also fine if you expose /api/tasks/unassigned
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(r.status).toBe(200);
    expect(titlesFromList(data(r))).toContain(titles.t3);
  });

  it('returns aggregated project progress for managers/owners', async () => {
    const r = await request(app)
      .get(`/api/projects/${p2}/progress`)
      .set('Authorization', `Bearer ${managerToken}`);
    expect(r.status).toBe(200);
    const stats = data(r);
    expect(stats.total).toBeGreaterThanOrEqual(2);
    expect(stats).toHaveProperty('unassigned');
    expect(stats).toHaveProperty('ongoing');
    expect(stats).toHaveProperty('under_review');
    expect(stats).toHaveProperty('completed');
    expect(stats).toHaveProperty('percent');
  });

  it('blocks non-owner/staff from editing project name', async () => {
    const r = await request(app)
      .put(`/api/projects/${p1}`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ name: 'Hacked' });
    expect([401, 403]).toContain(r.status);
  });
});
