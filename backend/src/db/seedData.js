require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB } = require('./connect');
const { User, Task, Project, Subtask, Comment, ActivityLog, Department, Team } = require('./models');

const taskService = require('../services/taskService');
const projectService = require('../services/projectService');
const subtaskService = require('../services/subtaskService');

const seedDatabase = async () => {

  try {
    await connectDB();
    console.log('🔄 Preparing database...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Task.deleteMany({}),
      Project.deleteMany({}),
      Subtask.deleteMany({}),
      Comment.deleteMany({}),
      ActivityLog.deleteMany({}),
      Department.deleteMany({}),
      Team.deleteMany({})
    ]);

    // Create sample users with different roles
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Create users without department/team
    const smUser = await User.create({
      name: 'Senior Manager',
      email: 'sm@example.com',
      passwordHash: hashedPassword,
      role: 'sm'
    });

    const hrUser = await User.create({
      name: 'HR Personnel',
      email: 'hr@example.com',
      passwordHash: hashedPassword,
      role: 'hr'
    });

    // Create department and director
    const engineeringDept = await Department.create({
      name: 'Engineering',
      description: 'Software Development and Engineering'
    });

    const directorUser = await User.create({
      name: 'Department Director',
      email: 'director@example.com',
      passwordHash: hashedPassword,
      role: 'director',
      departmentId: engineeringDept._id
    });

    engineeringDept.directorId = directorUser._id;
    await engineeringDept.save();

    // Create team and its members
    const frontendTeam = await Team.create({
      name: 'Frontend Development',
      departmentId: engineeringDept._id,
      description: 'Web and Mobile Frontend Development'
    });

    const managerUser = await User.create({
      name: 'Team Manager',
      email: 'manager@example.com',
      passwordHash: hashedPassword,
      role: 'manager',
      departmentId: engineeringDept._id,
      teamId: frontendTeam._id
    });

    frontendTeam.managerId = managerUser._id;
    await frontendTeam.save();

    const staffUser = await User.create({
      name: 'Staff Member',
      email: 'staff@example.com',
      passwordHash: hashedPassword,
      role: 'staff',
      departmentId: engineeringDept._id,
      teamId: frontendTeam._id
    });

    // Create a sample project with tasks
    const sampleProject = await projectService.createProject({
      name: 'Website Redesign',
      description: 'Redesign company website with modern UI/UX',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      departmentId: engineeringDept._id,
      collaborators: [managerUser._id, staffUser._id]
    }, directorUser._id);

    const mainTask = await taskService.createTask({
      title: 'Implement New Homepage',
      description: 'Create and implement new homepage design with modern UI/UX principles',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      status: 'ongoing',
      assigneeId: staffUser._id,
      projectId: sampleProject.id,
      collaborators: [managerUser._id, staffUser._id],
      attachments: [{
        filename: 'design-spec.pdf',
        path: '/attachments/design-spec.pdf',
        uploadedBy: managerUser._id,
        uploadedAt: new Date()
      }]
    }, managerUser._id);

    const subtasks = await Promise.all([
      subtaskService.createSubtask(mainTask.id, {
        title: 'Design Hero Section',
        description: 'Create responsive hero section with dynamic content',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'ongoing',
        assigneeId: staffUser._id,
        collaborators: [staffUser._id]
      }, managerUser._id),
      subtaskService.createSubtask(mainTask.id, {
        title: 'Implement Navigation Menu',
        description: 'Create responsive navigation with mobile support',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        status: 'unassigned',
        collaborators: [staffUser._id]
      }, managerUser._id)
    ]);

    await Promise.all([
      Comment.create({
        taskId: mainTask.id,
        userId: managerUser._id,
        content: 'Please follow the brand guidelines for colors and typography',
        attachments: [{
          filename: 'brand-guidelines.pdf',
          path: '/attachments/brand-guidelines.pdf',
          uploadedAt: new Date()
        }]
      }),
      Comment.create({
        taskId: mainTask.id,
        userId: staffUser._id,
        content: 'I\'ll start with the hero section mockup today'
      })
    ]);

    const reviewTask = await taskService.createTask({
      title: 'Update Privacy Policy',
      description: 'Update privacy policy to comply with new regulations',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      status: 'ongoing',
      projectId: sampleProject.id,
      assigneeId: staffUser._id,
      collaborators: [managerUser._id, staffUser._id]
    }, staffUser._id);

    await taskService.updateTask(reviewTask.id, {
      status: 'under_review'
    }, staffUser._id);

    console.log('\n✨ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();