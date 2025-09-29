const Task = require('../../models/Task');

module.exports = async function seedTasks(_count, { users, projects }) {
  await Task.deleteMany({});

  const staff = users.find(u => u.role === 'staff') || users[0];
  const manager = users.find(u => u.role === 'manager') || staff;
  const director = users.find(u => u.role === 'director') || manager;
  const hr = users.find(u => u.role === 'hr') || director;
  const sm = users.find(u => u.role === 'sm') || hr;

  const websiteProject = projects.find(p => p.name === 'Website Revamp') || projects[0];
  const platformProject = projects.find(p => p.name === 'Platform Reliability') || projects[1] || projects[0];
  const salesCRM = projects.find(p => p.name === 'Sales CRM Upgrade') || platformProject;
  const onboarding = projects.find(p => p.name === 'Onboarding Revamp') || websiteProject;

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const docs = [
    // Unassigned
    {
      title: 'Design new homepage',
      description: 'Create wireframes and hi-fi designs for homepage',
      status: 'unassigned',
      dueDate: new Date(now + 7 * day),
      createdBy: manager._id,
      assigneeId: undefined,
      projectId: websiteProject._id,
      collaborators: [manager._id],
      attachments: [],
      isDeleted: false,
    },
    // Ongoing (Staff)
    {
      title: 'Implement homepage',
      description: 'Build homepage in Next.js with Tailwind',
      status: 'ongoing',
      dueDate: new Date(now + 14 * day),
      createdBy: manager._id,
      assigneeId: staff._id,
      projectId: websiteProject._id,
      collaborators: [manager._id],
      attachments: [],
      isDeleted: false,
    },
    // Under review (Staff)
    {
      title: 'Improve API latency',
      description: 'Profile slow endpoints and add caching',
      status: 'under_review',
      dueDate: new Date(now + 21 * day),
      createdBy: manager._id,
      assigneeId: staff._id,
      projectId: platformProject._id,
      collaborators: [manager._id],
      attachments: [],
      isDeleted: false,
    },
    // Completed (Director)
    {
      title: 'Finalize Q3 report',
      description: 'Compile and finalize departmental KPIs',
      status: 'completed',
      dueDate: new Date(now - 2 * day),
      createdBy: director._id,
      assigneeId: director._id,
      projectId: platformProject._id,
      collaborators: [manager._id],
      attachments: [],
      isDeleted: false,
    },
    // Ongoing (HR)
    {
      title: 'HR policy review',
      description: 'Review and update leave policy',
      status: 'ongoing',
      dueDate: new Date(now + 10 * day),
      createdBy: hr._id,
      assigneeId: hr._id,
      projectId: websiteProject._id,
      collaborators: [],
      attachments: [],
      isDeleted: false,
    },
    // Under review (SM)
    {
      title: 'Strategy brief',
      description: 'Draft strategic initiatives for H2',
      status: 'under_review',
      dueDate: new Date(now + 30 * day),
      createdBy: sm._id,
      assigneeId: sm._id,
      projectId: platformProject._id,
      collaborators: [],
      attachments: [],
      isDeleted: false,
    },
    // Ongoing (Manager)
    {
      title: 'Team onboarding improvements',
      description: 'Standardize onboarding checklist and resources',
      status: 'ongoing',
      dueDate: new Date(now + 12 * day),
      createdBy: manager._id,
      assigneeId: manager._id,
      projectId: websiteProject._id,
      collaborators: [staff._id],
      attachments: [],
      isDeleted: false,
    },
    // Additional tasks reflecting project.md requirements
    {
      title: 'Migrate CRM fields',
      description: 'Normalize and migrate CRM field data',
      status: 'unassigned',
      dueDate: new Date(now + 18 * day),
      createdBy: manager._id,
      assigneeId: undefined,
      projectId: salesCRM._id,
      collaborators: [manager._id],
      attachments: [],
      isDeleted: false,
    },
    {
      title: 'Onboarding checklist draft',
      description: 'Draft new onboarding checklist and templates',
      status: 'ongoing',
      dueDate: new Date(now + 9 * day),
      createdBy: staff._id,
      assigneeId: staff._id,
      projectId: onboarding._id,
      collaborators: [manager._id],
      attachments: [],
      isDeleted: false,
    },
    {
      title: 'Department metrics review',
      description: 'Gather inputs from teams for quarterly review',
      status: 'under_review',
      dueDate: new Date(now + 25 * day),
      createdBy: director._id,
      assigneeId: staff._id,
      projectId: platformProject._id,
      collaborators: [manager._id, director._id],
      attachments: [],
      isDeleted: false,
    },
  ];
  const inserted = await Task.insertMany(docs, { ordered: true });
  return inserted.map((t) => t.toObject());
};


