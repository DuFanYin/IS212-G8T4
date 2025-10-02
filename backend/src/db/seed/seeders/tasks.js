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
  const onboarding = projects.find(p => p.name === 'Onboarding Revamp') || projects[4] || projects[0];

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const week = 7 * day;

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
  
  const inserted = await Task.insertMany(docs, { ordered: true });
  return inserted.map((t) => t.toObject());
};