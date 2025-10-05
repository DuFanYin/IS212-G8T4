const Task = require('../../models/Task');

module.exports = async function seedTasks(_count, { users, projects }) {
  await Task.deleteMany({});

  const staff = users.find(u => u.role === 'staff') || users[0];
  const manager = users.find(u => u.role === 'manager') || staff;
  const editor = users.find(u => u.role === 'director') || manager;
  const hr = users.find(u => u.role === 'hr') || editor;
  const sm = users.find(u => u.role === 'sm') || hr;

  const websiteProject = projects.find(p => p.name === 'Website Revamp') || projects[0];
  const platformProject = projects.find(p => p.name === 'Platform Reliability') || projects[1] || projects[0];
  const supportProject = projects.find(p => p.name === 'Support Triage Improvements') || projects[2] || projects[0];
  const salesCRM = projects.find(p => p.name === 'Sales CRM Upgrade') || projects[3] || projects[0];
  const onboarding = projects.find(p => p.name === 'Support Triage Improvements') || projects[2] || projects[0];

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const week = 7 * day;

  let priorityCounter = 1;
  function nextPriority() {
    const val = priorityCounter;
    priorityCounter = priorityCounter % 10 + 1;
    return val;
  }

  const docs = [
    // COMPLETED TASKS (Historical) - Various ages and complexity
    {
      title: 'Q4 Financial Report',
      description: 'Compile departmental budget analysis and variance reports for executive review',
      status: 'completed',
      dueDate: new Date(now - 8 * day),
      createdAt: new Date(now - 45 * day),
      createdBy: editor._id,
      assigneeId: staff._id,  // Assign to staff user for visibility
      projectId: platformProject._id,
      collaborators: [manager._id, hr._id, staff._id],
      attachments: [
        {
          filename: 'financial-summary.pdf',
          path: '/uploads/financial-summary.pdf',
          uploadedBy: manager._id,
          uploadedAt: new Date(now - 45 * day)
        },
        {
          filename: 'budget-variance.xlsx',
          path: '/uploads/budget-variance.xlsx',
          uploadedBy: manager._id,
          uploadedAt: new Date(now - 44 * day)
        }
      ],
      priority: nextPriority(),
      isDeleted: false,
    },

    {
      title: 'Legacy API Documentation',
      description: 'Create comprehensive API documentation for legacy endpoints',
      status: 'completed',
      dueDate: new Date(now - 12 * day),
      createdAt: new Date(now - 42 * day),
      createdBy: manager._id,
      assigneeId: staff._id,
      projectId: platformProject._id,
      collaborators: [manager._id],
      attachments: [
        {
          filename: 'api-specs.pdf',
          path: '/uploads/api-specs.pdf',
          uploadedBy: manager._id,
          uploadedAt: new Date(now - 42 * day)
        }
      ],
      priority: nextPriority(),
      isDeleted: false,
    },

    {
      title: 'Customer Satisfaction Survey',
      description: 'Design and distribute quarterly customer satisfaction survey',
      status: 'completed',
      dueDate: new Date(now - 5 * day),
      createdAt: new Date(now - 23 * day),
      createdBy: hr._id,
      assigneeId: hr._id,
      projectId: websiteProject._id,
      collaborators: [manager._id],
      attachments: [
        {
          filename: 'survey-results.pdf',
          path: '/uploads/survey-results.pdf',
          uploadedBy: hr._id,
          uploadedAt: new Date(now - 23 * day)
        }
      ],
      priority: nextPriority(),
      isDeleted: false,
    },

    // TASKS WITH SUBTASKS - MUST BE ONGOING OR UNDER_REVIEW SINCE SUBTASKS INCOMPLETE
    
    // E-commerce Platform Implementation (Complex multi-phase project)
    {
      title: 'E-commerce Platform Implementation',
      description: 'Build new e-commerce platform with payment integration and inventory management',
      status: 'ongoing',
      dueDate: new Date(now + 35 * day),
      createdAt: new Date(now - 52 * day),
      createdBy: editor._id,
      assigneeId: manager._id,
      projectId: websiteProject._id,
      collaborators: [manager._id, staff._id],
      attachments: [
        {
          filename: 'platform-requirements.pdf',
          path: '/uploads/platform-requirements.pdf',
          uploadedBy: editor._id,
          uploadedAt: new Date(now - 52 * day)
        },
        {
          filename: 'architecture-v1.pdf',
          path: '/uploads/architecture-v1.pdf',
          uploadedBy: editor._id,
          uploadedAt: new Date(now - 50 * day)
        }
      ],
      priority: nextPriority(),
      isDeleted: false,
    },

    // API Performance Optimization (Technical optimization)
    {
      title: 'API Performance Optimization',
      description: 'Implement caching, database query optimization, and CDN integration',
      status: 'ongoing',
      dueDate: new Date(now + 28 * day),
      createdAt: new Date(now - 38 * day),
      createdBy: manager._id,
      assigneeId: staff._id,
      projectId: platformProject._id,
      collaborators: [manager._id],
      attachments: [
        {
          filename: 'performance-benchmarks.pdf',
          path: '/uploads/performance-benchmarks.pdf',
          uploadedBy: manager._id,
          uploadedAt: new Date(now - 38 * day)
        }
      ],
      priority: nextPriority(),
      isDeleted: false,
    },

    // Customer Support Process Overhaul (Operations improvement)
    {
      title: 'Customer Support Process Overhaul',
      description: 'Redesign support workflows and implement automated categorization',
      status: 'ongoing',
      dueDate: new Date(now + 22 * day),
      createdAt: new Date(now - 31 * day),
      createdBy: manager._id,
      assigneeId: staff._id,
      projectId: supportProject._id,
      collaborators: [manager._id, hr._id],
      attachments: [
        {
          filename: 'current-workflows.pdf',
          path: '/uploads/current-workflows.pdf',
          uploadedBy: manager._id,
          uploadedAt: new Date(now - 31 * day)
        }
      ],
      priority: nextPriority(),
      isDeleted: false,
    },

    // Employee Onboarding Enhancement (HR process)
    {
      title: 'Employee Onboarding Enhancement',
      description: 'Revamp onboarding process with interactive materials and mentorship program',
      status: 'ongoing',
      dueDate: new Date(now + 18 * day),
      createdAt: new Date(now - 25 * day),
      createdBy: hr._id,
      assigneeId: staff._id,
      projectId: onboarding._id,
      collaborators: [manager._id, hr._id],
      attachments: [
        {
          filename: 'current-onboarding-flow.pdf',
          path: '/uploads/current-onboarding-flow.pdf',
          uploadedBy: hr._id,
          uploadedAt: new Date(now - 25 * day)
        }
      ],
      priority: nextPriority(),
      isDeleted: false,
    },

    // CRM Sales Pipeline Optimization (Sales improvement)
    {
      title: 'CRM Sales Pipeline Optimization',
      description: 'Optimize CRM workflows and implement lead scoring algorithms',
      status: 'ongoing',
      dueDate: new Date(now + 30 * day),
      createdAt: new Date(now - 33 * day),
      createdBy: sm._id,
      assigneeId: manager._id,
      projectId: salesCRM._id,
      collaborators: [sm._id, staff._id],
      attachments: [
        {
          filename: 'current-pipeline-analysis.pdf',
          path: '/uploads/current-pipeline-analysis.pdf',
          uploadedBy: sm._id,
          uploadedAt: new Date(now - 33 * day)
        }
      ],
      priority: nextPriority(),
      isDeleted: false,
    },

    // TASKS WITHOUT SUBTASKS - Can be in any status

    // Recently Completed
    {
      title: 'Security Vulnerability Assessment',
      description: 'Conduct comprehensive security audit and address identified vulnerabilities',
      status: 'completed',
      dueDate: new Date(now - 3 * day),
      createdAt: new Date(now - 19 * day),
      createdBy: editor._id,
      assigneeId: staff._id,
      projectId: platformProject._id,
      collaborators: [manager._id],
      attachments: [
        {
          filename: 'security-report.pdf',
          path: '/uploads/security-report.pdf',
          uploadedBy: editor._id,
          uploadedAt: new Date(now - 19 * day)
        },
        {
          filename: 'vulnerability-patches.zip',
          path: '/uploads/vulnerability-patches.zip',
          uploadedBy: editor._id,
          uploadedAt: new Date(now - 18 * day)
        }
      ],
      priority: nextPriority(),
      isDeleted: false,
    },

    {
      title: 'Mobile App Design System',
      description: 'Create comprehensive design system for mobile applications',
      status: 'completed',
      dueDate: new Date(now - 7 * day),
      createdAt: new Date(now - 35 * day),
      createdBy: manager._id,
      assigneeId: manager._id,
      projectId: websiteProject._id,
      collaborators: [staff._id],
      attachments: [
        {
          filename: 'design-system-v2.pdf',
          path: '/uploads/design-system-v2.pdf',
          uploadedBy: manager._id,
          uploadedAt: new Date(now - 35 * day)
        },
        {
          filename: 'component-library.zip',
          path: '/uploads/component-library.zip',
          uploadedBy: manager._id,
          uploadedAt: new Date(now - 34 * day)
        }
      ],
      priority: nextPriority(),
      isDeleted: false,
    },

    // Under Review Projects
    {
      title: 'Data Migration Strategy',
      description: 'Plan and execute migration from legacy database to cloud infrastructure',
      status: 'under_review',
      dueDate: new Date(now + 15 * day),
      createdAt: new Date(now - 12 * day),
      createdBy: manager._id,
      assigneeId: manager._id,
      projectId: platformProject._id,
      collaborators: [staff._id],
      attachments: [
        {
          filename: 'migration-plan.pdf',
          path: '/uploads/migration-plan.pdf',
          uploadedBy: manager._id,
          uploadedAt: new Date(now - 12 * day)
        }
      ],
      isDeleted: false,
    },

    {
      title: 'Social Media Strategy Revamp',
      description: 'Develop new social media strategy and content calendar for Q1',
      status: 'under_review',
      dueDate: new Date(now + 12 * day),
      createdAt: new Date(now - 16 * day),
      createdBy: hr._id,
      assigneeId: hr._id,
      projectId: salesCRM._id,
      collaborators: [manager._id],
      attachments: [
        {
          filename: 'current-social-audit.pdf',
          path: '/uploads/current-social-audit.pdf',
          uploadedBy: hr._id,
          uploadedAt: new Date(now - 16 * day)
        }
      ],
      isDeleted: false,
    },

    // Ongoing Single Tasks
    {
      title: 'Competitor Analysis Report',
      description: 'Analyze competitors and market positioning for Q1 strategy session',
      status: 'ongoing',
      dueDate: new Date(now + 20 * day),
      createdAt: new Date(now - 14 * day),
      createdBy: sm._id,
      assigneeId: sm._id,
      projectId: salesCRM._id,
      collaborators: [],
      attachments: [
        {
          filename: 'competitor-template.xlsx',
          path: '/uploads/competitor-template.xlsx',
          uploadedBy: sm._id,
          uploadedAt: new Date(now - 14 * day)
        }
      ],
      isDeleted: false,
    },

    {
      title: 'Website Performance Audit',
      description: 'Analyze website performance, accessibility, and SEO optimization',
      status: 'ongoing',
      dueDate: new Date(now + 25 * day),
      createdAt: new Date(now - 8 * day),
      createdBy: manager._id,
      assigneeId: staff._id,
      projectId: websiteProject._id,
      collaborators: [manager._id],
      attachments: [
        {
          filename: 'current-performance-report.pdf',
          path: '/uploads/current-performance-report.pdf',
          uploadedBy: manager._id,
          uploadedAt: new Date(now - 8 * day)
        }
      ],
      isDeleted: false,
    },

    // Unassigned New Projects
    {
      title: 'Digital Transformation Workshop',
      description: 'Plan and coordinate company-wide digital transformation training workshop',
      status: 'unassigned',
      dueDate: new Date(now + 40 * day),
      createdAt: new Date(now - 6 * day),
      createdBy: editor._id,
      assigneeId: null,
      projectId: onboarding._id,
      collaborators: [hr._id, manager._id],
      attachments: [],
      isDeleted: false,
    },

    {
      title: 'AI-Powered Analytics Dashboard',
      description: 'Design and implement ML-powered analytics dashboard for business intelligence',
      status: 'unassigned',
      dueDate: new Date(Date.now() + 60 * day),
      createdAt: new Date(now - 2 * day),
      createdBy: manager._id,
      assigneeId: null,
      projectId: platformProject._id,
      collaborators: [staff._id],
      attachments: [
        {
          filename: 'dashboard-requirements.pdf',
          path: '/uploads/dashboard-requirements.pdf',
          uploadedBy: manager._id,
          uploadedAt: new Date(now - 2 * day)
        }
      ],
      isDeleted: false,
    },

    {
      title: 'Remote Team Collaboration Tools',
      description: 'Evaluate and implement tools for remote team collaboration and productivity',
      status: 'unassigned',
      dueDate: new Date(Date.now() + 35 * day),
      createdAt: new Date(now - 1 * day),
      createdBy: hr._id,
      assigneeId: null,
      projectId: onboarding._id,
      collaborators: [manager._id, hr._id],
      attachments: [],
      isDeleted: false,
    },

   // Recently Created Tasks
    {
      title: 'Q1 Strategic Planning Meeting',
      description: 'Organize quarterly planning meeting for leadership team',
      status: 'ongoing',
      dueDate: new Date(now + 18 * day),
      createdAt: new Date(now - 4 * day),
      createdBy: editor._id,
      assigneeId: editor._id,
      projectId: platformProject._id,
      collaborators: [manager._id, sm._id],
      attachments: [
        {
          filename: 'agenda-template.docx',
          path: '/uploads/agenda-template.docx',
          uploadedBy: editor._id,
          uploadedAt: new Date(now - 4 * day)
        },
        {
          filename: 'budget-estimates.xlsx',
          path: '/uploads/budget-estimates.xlsx',
          uploadedBy: editor._id,
          uploadedAt: new Date(now - 3 * day)
        }
      ],
      isDeleted: false,
    },
  ];

  // Ensure per-team distribution: 2 teams → 1 task, 2 teams → 2 tasks, 2 teams → 3 tasks
  try {
    const byTeam = new Map();
    (users || []).forEach(u => {
      if (!u?.teamId) return;
      const key = u.teamId.toString();
      const arr = byTeam.get(key) || [];
      arr.push(u);
      byTeam.set(key, arr);
    });

    const future = (days) => new Date(Date.now() + days * day);

    const teamIds = Array.from(byTeam.keys());
    // Sort for determinism
    teamIds.sort();
    const distribution = new Map();
    // Assign 1,1,2,2,3,3 repeating over available teams
    const pattern = [1,1,2,2,3,3];
    for (let i = 0; i < teamIds.length; i++) {
      distribution.set(teamIds[i], pattern[i % pattern.length]);
    }

    teamIds.forEach((teamId) => {
      const teamUsers = byTeam.get(teamId) || [];
      // Prefer a manager as creator, else any user in team
      const creator = teamUsers.find(u => u.role === 'manager') || teamUsers[0];
      if (!creator) return;
      // Prefer a staff as assignee, else creator
      const assignee = teamUsers.find(u => u.role === 'staff') || creator;

      // Try to find a project in the same department as the creator
      const deptIdStr = creator.departmentId?.toString?.();
      const projectSameDept = (projects || []).find(p => p.departmentId?.toString?.() === deptIdStr) || projects[0];

      const count = distribution.get(teamId) || 1;
      for (let i = 0; i < count; i++) {
        const isStandalone = i % 2 === 0 || !projectSameDept?._id; // alternate, ensure at least one standalone
        docs.push({
          title: `Team ${teamId.slice(-4)} Task ${i+1}`,
          description: isStandalone ? 'Standalone team task' : 'Project-linked team task',
          status: i % 3 === 0 ? 'ongoing' : (i % 3 === 1 ? 'under_review' : 'unassigned'),
          dueDate: future(10 + i * 3),
          createdAt: new Date(now - (2 + i) * day),
          createdBy: creator._id,
          assigneeId: assignee?._id || null,
          projectId: isStandalone ? null : projectSameDept?._id,
          collaborators: [assignee?._id, creator._id].filter(Boolean),
          attachments: [],
          isDeleted: false,
        });
      }
    });
  } catch (e) {
    // Best-effort seeding; do not fail if association logic errors out
    console.error('Non-fatal: team-based task seeding skipped:', e?.message || e);
  }
  
  // Rebalance creators/assignees/collaborators to spread across departments/teams
  try {
    const deptIds = Array.from(new Set((projects || []).map(p => p.departmentId?.toString?.()).filter(Boolean)));
    const projectDept = new Map();
    (projects || []).forEach(p => {
      if (p?._id && p?.departmentId) {
        projectDept.set(p._id.toString(), p.departmentId.toString());
      }
    });

    // Build user pools by department and role
    const byDeptManagers = new Map();
    const byDeptStaff = new Map();
    (users || []).forEach(u => {
      const d = u?.departmentId?.toString?.();
      if (!d) return;
      if (u.role === 'manager') {
        const arr = byDeptManagers.get(d) || [];
        arr.push(u);
        byDeptManagers.set(d, arr);
      } else if (u.role === 'staff') {
        const arr = byDeptStaff.get(d) || [];
        arr.push(u);
        byDeptStaff.set(d, arr);
      }
    });

    let standaloneDeptIndex = 0;
    let counters = new Map(); // deptId -> { m: idx, s: idx }

    function pickFromPool(map, deptId, kind) {
      const list = map.get(deptId) || [];
      if (list.length === 0) return null;
      const key = `${deptId}:${kind}`;
      const prev = counters.get(key) || 0;
      const picked = list[prev % list.length];
      counters.set(key, prev + 1);
      return picked;
    }

    docs.forEach((doc, i) => {
      let deptId;
      if (doc.projectId && projectDept.has(doc.projectId?.toString?.())) {
        deptId = projectDept.get(doc.projectId.toString());
      } else if (deptIds.length > 0) {
        deptId = deptIds[standaloneDeptIndex % deptIds.length];
        standaloneDeptIndex += 1;
      }
      if (!deptId) return;

      const mgr = pickFromPool(byDeptManagers, deptId, 'm') || doc.createdBy;
      const stf = pickFromPool(byDeptStaff, deptId, 's') || doc.assigneeId || mgr;

      doc.createdBy = mgr?._id || mgr || doc.createdBy;
      doc.assigneeId = stf?._id || stf || null;

      // Limit collaborators to within department, small set
      const collSet = [];
      if (doc.assigneeId) collSet.push(doc.assigneeId);
      if (doc.createdBy) collSet.push(doc.createdBy);
      // Add one more staff from same dept if available
      const extra = pickFromPool(byDeptStaff, deptId, 's');
      if (extra && extra._id && !collSet.find(id => id.toString() === extra._id.toString())) {
        collSet.push(extra._id);
      }
      doc.collaborators = collSet.filter(Boolean);
    });
  } catch (e) {
    console.error('Non-fatal: task rebalancing skipped:', e?.message || e);
  }

  // Enforce: 5 projects have 5 tasks each, plus 5 standalone tasks
  try {
    const dayMs = 24 * 60 * 60 * 1000;
    const future = (days) => new Date(Date.now() + days * dayMs);

    // Build project list (first 5) and count current tasks per project
    const targetProjects = (projects || []).slice(0, 5);
    const projectIdStrs = targetProjects.map(p => p?._id?.toString?.()).filter(Boolean);
    const projectCounts = new Map();
    docs.forEach(d => {
      const pid = d.projectId?.toString?.();
      if (pid && projectIdStrs.includes(pid)) {
        projectCounts.set(pid, (projectCounts.get(pid) || 0) + 1);
      }
    });

    // Build department → managers/staff pools
    const byDeptManagers = new Map();
    const byDeptStaff = new Map();
    (users || []).forEach(u => {
      const d = u?.departmentId?.toString?.();
      if (!d) return;
      if (u.role === 'manager') {
        const arr = byDeptManagers.get(d) || [];
        arr.push(u);
        byDeptManagers.set(d, arr);
      } else if (u.role === 'staff') {
        const arr = byDeptStaff.get(d) || [];
        arr.push(u);
        byDeptStaff.set(d, arr);
      }
    });

    const counters = new Map();
    function pick(map, deptId, key) {
      const list = map.get(deptId) || [];
      if (list.length === 0) return null;
      const k = `${deptId}:${key}`;
      const i = counters.get(k) || 0;
      counters.set(k, i + 1);
      return list[i % list.length];
    }

    // Ensure 5 tasks per each of the first 5 projects
    targetProjects.forEach((p, idx) => {
      const pid = p?._id?.toString?.();
      const deptId = p?.departmentId?.toString?.();
      if (!pid || !deptId) return;
      const have = projectCounts.get(pid) || 0;
      for (let i = have; i < 5; i++) {
        const creator = pick(byDeptManagers, deptId, 'm') || users.find(u => u.role === 'manager') || users[0];
        const assignee = pick(byDeptStaff, deptId, 's') || users.find(u => u.role === 'staff') || creator;
        docs.push({
          title: `${p.name} Task ${i + 1}`,
          description: 'Seeded to ensure project grouping coverage',
          status: i % 2 === 0 ? 'ongoing' : 'under_review',
          dueDate: future(20 + i),
          createdAt: new Date(Date.now() - (3 + i) * dayMs),
          createdBy: creator?._id || creator,
          assigneeId: assignee?._id || assignee,
          projectId: p._id,
          collaborators: [creator?._id || creator, assignee?._id || assignee].filter(Boolean),
          attachments: [],
          isDeleted: false,
        });
      }
    });

    // Ensure at least 5 standalone tasks (projectId null)
    const currentStandalone = docs.filter(d => !d.projectId).length;
    const needStandalone = Math.max(0, 5 - currentStandalone);
    const deptIds = Array.from(byDeptManagers.keys());
    for (let s = 0; s < needStandalone; s++) {
      const deptId = deptIds[s % (deptIds.length || 1)] || (projects[0]?.departmentId?.toString?.());
      const creator = pick(byDeptManagers, deptId, 'm') || users.find(u => u.role === 'manager') || users[0];
      const assignee = pick(byDeptStaff, deptId, 's') || users.find(u => u.role === 'staff') || creator;
      docs.push({
        title: `Standalone Task ${s + 1}`,
        description: 'Seeded standalone task for distribution',
        status: s % 3 === 0 ? 'unassigned' : (s % 3 === 1 ? 'ongoing' : 'under_review'),
        dueDate: future(12 + s),
        createdAt: new Date(Date.now() - (2 + s) * dayMs),
        createdBy: creator?._id || creator,
        assigneeId: assignee?._id || assignee,
        projectId: null,
        collaborators: [assignee?._id || assignee, creator?._id || creator].filter(Boolean),
        attachments: [],
        isDeleted: false,
      });
    }
  } catch (e) {
    console.error('Non-fatal: project/standalone enforcement skipped:', e?.message || e);
  }

  const inserted = await Task.insertMany(docs, { ordered: true });
  return inserted.map((t) => t.toObject());
};