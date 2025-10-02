const Subtask = require('../../models/Subtask');

// Simple seeded random number generator for consistent results
class SeededRandom {
  constructor(seed = 12345) {
    this.seed = seed;
  }
  
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  randomInRange(min, max) {
    return min + (max - min) * this.next();
  }
  
  randomInt(min, max) {
    return Math.floor(this.randomInRange(min, max + 1));
  }
}

function pickAssigneeForTask(task) {
  // Prefer existing task assignee; else fall back to a task collaborator; else creator
  if (task.assigneeId) return task.assigneeId;
  if (Array.isArray(task.collaborators) && task.collaborators.length > 0) return task.collaborators[0];
  return task.createdBy;
}

function buildCollaborators(task) {
  // Must be a subset of the parent task collaborators per requirements
  // If task has no collaborators, return empty array
  const collabs = Array.isArray(task.collaborators) ? task.collaborators.filter(Boolean) : [];
  return collabs;
}

// Generate subtask dates within parent task boundaries - ENFORCED STRICT BOUNDARIES
function generateSubtaskDates(parentTask, taskIndex, rng) {
  const parentStart = new Date(parentTask.createdAt).getTime();
  const parentEnd = new Date(parentTask.dueDate).getTime();
  const parentDuration = parentEnd - parentStart;
  
  // STRICT ENFORCEMENT: Subtask CANNOT start before parent starts
  const earliestStart = parentStart;
  // Subtask should start within first 80% of parent duration (leave buffer for completion)
  const latestStart = parentStart + parentDuration * 0.8;
  
  // Generate start date within STRICT allowed range
  const startTime = Math.max(earliestStart, Math.min(latestStart, rng.randomInRange(earliestStart, latestStart)));
  
  // Due date enforcement: MUST be before parent due date with MINIMUM 1 day buffer
  const minDueDuration = 1 * 24 * 60 * 60 * 1000; // At least 1 day duration  
  const maxDueDuration = Math.min(parentDuration * 0.9, (parentEnd - startTime - 24 * 60 * 60 * 1000)); // Max 90% but NO MORE than time left
  const dueDuration = Math.max(minDueDuration, Math.min(maxDueDuration, rng.randomInRange(minDueDuration, maxDueDuration)));
  const dueTime = startTime + dueDuration;
  
  // FINAL SAFETY CHECK: Ensure due time NEVER exceeds parent end
  const finalDueTime = Math.min(dueTime, parentEnd - 24 * 60 * 60 * 1000);
  
  // Double-check: subtask MUST be completely contained within parent boundaries
  if (startTime < parentStart || finalDueTime > parentEnd) {
    console.error('VIOLATION: Subtask exceeds parent boundaries!', {
      parentTitle: parentTask.title,
      parentStart: new Date(parentStart),
      parentEnd: new Date(parentEnd),
      subtaskStart: new Date(startTime),
      subtaskEnd: new Date(finalDueTime)
    });
  }
  
  return {
    createdAt: new Date(startTime),
    dueDate: new Date(finalDueTime)
  };
}

module.exports = async function seedSubtasks(_count, { tasks }) {
  await Subtask.deleteMany({});

  // Select parent tasks by title with safe fallbacks
  const ecommerce = tasks.find(t => t.title === 'E-commerce Platform Implementation') || tasks[0];
  const apiOptimization = tasks.find(t => t.title === 'API Performance Optimization') || tasks[1] || tasks[0];
  const supportOverhaul = tasks.find(t => t.title === 'Customer Support Process Overhaul') || tasks[2] || tasks[0];
  const onboardingEnhancement = tasks.find(t => t.title === 'Employee Onboarding Enhancement') || tasks.find(t => t.title?.toLowerCase?.().includes('onboarding')) || ecommerce;
  const crmOptimization = tasks.find(t => t.title === 'CRM Sales Pipeline Optimization') || apiOptimization;

  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const week = 7 * day;

  // Initialize random generators for different parent tasks
  const rng = new SeededRandom(12345); // Fixed seed for consistent results

  const docs = [];

  // ECOMMERCE PLATFORM IMPLEMENTATION SUBTASKS
  const ecommerceSubtasks = [
    {
      title: 'Design Product Catalog Schema',
      description: 'Design database schema for products, categories, attributes, and inventory',
      status: 'completed'
    },
    {
      title: 'Implement Payment Gateway Integration', 
      description: 'Integrate Stripe payment gateway with security best practices',
      status: 'ongoing'
    },
    {
      title: 'Build Shopping Cart & Checkout Flow',
      description: 'Implement cart persistence and multi-step checkout process',
      status: 'under_review'
    },
    {
      title: 'Implement Order Management System',
      description: 'Build order processing, tracking, and fulfillment workflows',
      status: 'unassigned'
    },
    {
      title: 'Design Responsive Product Pages',
      description: 'Create mobile-first product detail pages with image galleries',
      status: 'ongoing'
    }
  ];

  ecommerceSubtasks.forEach((subtask, index) => {
    const dates = generateSubtaskDates(ecommerce, index, rng);
    docs.push({
      parentTaskId: ecommerce._id,
      title: subtask.title,
      description: subtask.description,
      ...dates,
      status: subtask.status,
      assigneeId: pickAssigneeForTask(ecommerce),
      collaborators: buildCollaborators(ecommerce),
    });
  });

  // API PERFORMANCE OPTIMIZATION SUBTASKS
  const apiSubtasks = [
    {
      title: 'Implement Redis Caching Layer',
      description: 'Set up Redis cluster with appropriate TTL policies for API responses',
      status: 'completed'
    },
    {
      title: 'Optimize Database Queries',
      description: 'Analyze slow queries and add indexes for performance improvement',
      status: 'ongoing'
    },
    {
      title: 'Implement API Response Compression',
      description: 'Add gzip compression and response optimization for faster loading',
      status: 'under_review'
    },
    {
      title: 'Set Up CDN Integration',
      description: 'Configure CloudFront for static asset delivery and global caching',
      status: 'unassigned'
    }
  ];

  apiSubtasks.forEach((subtask, index) => {
    const dates = generateSubtaskDates(apiOptimization, index, rng);
    docs.push({
      parentTaskId: apiOptimization._id,
      title: subtask.title,
      description: subtask.description,
      ...dates,
      status: subtask.status,
      attachId: pickAssigneeForTask(apiOptimization),
      collaborators: buildCollaborators(apiOptimization),
    });
  });

  // CUSTOMER SUPPORT PROCESS OVERHAUL SUBTASKS
  const supportSubtasks = [
    {
      title: 'Audit Current Support Ticket Categories',
      description: 'Analyze existing tickets and identify top problematic categories',
      status: 'completed'
    },
    {
      title: 'Design New Ticket Routing Logic',
      description: 'Create intelligent routing system based on category and urgency',
      status: 'ongoing'
    },
    {
      title: 'Implement Automated Response Templates',
      description: 'Create common response templates and auto-reply system',
      status: 'under_review'
    },
    {
      title: 'Train Support Team on New Workflows',
      description: 'Conduct training sessions for support team on revised processes',
      status: 'unassigned'
    }
  ];

  supportSubtasks.forEach((subtask, index) => {
    const dates = generateSubtaskDates(supportOverhaul, index, rng);
    docs.push({
      parentTaskId: supportOverhaul._id,
      title: subtask.title,
      description: subtask.description,
      ...dates,
      status: subtask.status,
      assigneeId: pickAssigneeForTask(supportOverhaul),
      collaborators: buildCollaborators(supportOverhaul),
    });
  });

  // EMPLOYEE ONBOARDING ENHANCEMENT SUBTASKS
  const onboardingSubtasks = [
    {
      title: 'Research Current Onboarding Pain Points',
      description: 'Survey new employees and identify bottlenecks in current process',
      status: 'completed'
    },
    {
      title: 'Design Interactive Learning Modules',
      description: 'Create engaging digital content for company culture and policies',
      status: 'ongoing'
    },
    {
      title: 'Set Up Mentorship Matching System',
      description: 'Develop system to pair new hires with experienced employees',
      status: 'unassigned'
    },
    {
      title: 'Create Onboarding Checklist Templates',
      description: 'Develop role-specific onboarding checklists for different departments',
      status: 'ongoing'
    }
  ];

  onboardingSubtasks.forEach((subtask, index) => {
    const dates = generateSubtaskDates(onboardingEnhancement, index, rng);
    docs.push({
      parentTaskId: onboardingEnhancement._id,
      title: subtask.title,
      description: subtask.description,
      ...dates,
      status: subtask.status,
      assigneeId: pickAssigneeForTask(onboardingEnhancement),
      collaborators: buildCollaborators(onboardingEnhancement),
    });
  });

  // CRM SALES PIPELINE OPTIMIZATION SUBTASKS
  const crmSubtasks = [
    {
      title: 'Analyze Current Sales Pipeline Data',
      description: 'Review historical sales data and identify conversion bottlenecks',
      status: 'completed'
    },
    {
      title: 'Implement Lead Scoring Algorithm',
      description: 'Develop ML-based lead scoring to prioritize high-quality prospects',
      status: 'ongoing'
    },
    {
      title: 'Redesign Sales Stage Workflows',
      description: 'Optimize CRM workflows for each stage of the sales process',
      status: 'under_review'
    },
    {
      title: 'Integrate Email Automation Platform',
      description: 'Set up automated email sequences for lead nurturing campaigns',
      status: 'unassigned'
    },
    {
      title: 'Train Sales Team on New CRM Features',
      description: 'Conduct comprehensive training on optimized CRM workflows',
      status: 'unassigned'
    }
  ];

  crmSubtasks.forEach((subtask, index) => {
    const dates = generateSubtaskDates(crmOptimization, index, rng);
    docs.push({
      parentTaskId: crmOptimization._id,
      title: subtask.title,
      description: subtask.description,
      ...dates,
      status: subtask.status,
      assigneeId: pickAssigneeForTask(crmOptimization),
      collaborators: buildCollaborators(crmOptimization),
      });
  });

  // Predictable subtask for testing
  const testDates = generateSubtaskDates(ecommerce, 99, rng); // Use last index for test
  docs.push({
    parentTaskId: ecommerce._id,
    title: 'Seeded Subtask For Tests',
    description: 'Auto-generated stable subtask for testing purposes',
    ...testDates,
    status: 'unassigned',
    assigneeId: pickAssigneeForTask(ecommerce),
    collaborators: buildCollaborators(ecommerce),
  });

  const inserted = await Subtask.insertMany(docs, { ordered: true });
  return inserted.map((s) => s.toObject());
};