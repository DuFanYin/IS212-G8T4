require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB } = require('./connect');
const { User, Task, Project, Subtask, Comment, ActivityLog, Department, Team } = require('./models');

const TaskService = require('../services/taskService');
const ProjectService = require('../services/projectService');
const SubtaskService = require('../services/subtaskService');

const seedDatabase = async () => {

  try {
    await connectDB();
    console.log('Connected to MongoDB');

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
    console.log('Cleared existing data');

    // Create sample users with different roles
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Create SM user (no department/team required)
    const smUser = await User.create({
      name: 'Senior Manager',
      email: 'sm@example.com',
      passwordHash: hashedPassword,
      role: 'sm'
    });
    console.log('Created SM user:', smUser.email);

    // Create HR user (no department/team required)
    const hrUser = await User.create({
      name: 'HR Personnel',
      email: 'hr@example.com',
      passwordHash: hashedPassword,
      role: 'hr'
    });
    console.log('Created HR user:', hrUser.email);

    // Create Engineering Department
    const engineeringDept = await Department.create({
      name: 'Engineering',
      description: 'Software Development and Engineering'
    });
    console.log('Created Engineering Department');

    // Create Director (requires department)
    const directorUser = await User.create({
      name: 'Department Director',
      email: 'director@example.com',
      passwordHash: hashedPassword,
      role: 'director',
      departmentId: engineeringDept._id
    });
    console.log('Created Director user:', directorUser.email);

    // Update department with director
    engineeringDept.directorId = directorUser._id;
    await engineeringDept.save();

    // Create Frontend Development Team
    const frontendTeam = await Team.create({
      name: 'Frontend Development',
      departmentId: engineeringDept._id,
      description: 'Web and Mobile Frontend Development'
    });
    console.log('Created Frontend Team');

    // Create Manager (requires department and team)
    const managerUser = await User.create({
      name: 'Team Manager',
      email: 'manager@example.com',
      passwordHash: hashedPassword,
      role: 'manager',
      departmentId: engineeringDept._id,
      teamId: frontendTeam._id
    });
    console.log('Created Manager user:', managerUser.email);

    // Update team with manager
    frontendTeam.managerId = managerUser._id;
    await frontendTeam.save();

    // Create Staff (requires department and team)
    const staffUser = await User.create({
      name: 'Staff Member',
      email: 'staff@example.com',
      passwordHash: hashedPassword,
      role: 'staff',
      departmentId: engineeringDept._id,
      teamId: frontendTeam._id
    });
    console.log('Created Staff user:', staffUser.email);

    // Create a sample project using ProjectService
    const sampleProject = await ProjectService.createProject({
      name: 'Website Redesign',
      description: 'Redesign company website with modern UI/UX',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      departmentId: engineeringDept._id,
      collaborators: [managerUser._id, staffUser._id]
    }, directorUser._id);
    console.log('Created sample project:', sampleProject.name);

    // Create a main task using TaskService
    const mainTask = await TaskService.createTask({
      title: 'Implement New Homepage',
      description: 'Create and implement new homepage design with modern UI/UX principles',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      status: 'ongoing',
      assigneeId: staffUser._id,
      projectId: sampleProject._id,
      collaborators: [managerUser._id, staffUser._id],
      attachments: [{
        filename: 'design-spec.pdf',
        path: '/attachments/design-spec.pdf',
        uploadedBy: managerUser._id,
        uploadedAt: new Date()
      }]
    }, managerUser._id);
    console.log('Created main task:', mainTask.title);

    // Create subtasks using SubtaskService
    const subtasks = await Promise.all([
      SubtaskService.createSubtask(mainTask._id, {
        title: 'Design Hero Section',
        description: 'Create responsive hero section with dynamic content',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'ongoing',
        assigneeId: staffUser._id,
        collaborators: [staffUser._id]
      }, managerUser._id),
      SubtaskService.createSubtask(mainTask._id, {
        title: 'Implement Navigation Menu',
        description: 'Create responsive navigation with mobile support',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        status: 'unassigned',
        collaborators: [staffUser._id]
      }, managerUser._id)
    ]);
    console.log('Created subtasks:', subtasks.map(st => st.title).join(', '));

    // Create comments
    const comments = await Promise.all([
      Comment.create({
        taskId: mainTask._id,
        userId: managerUser._id,
        content: 'Please follow the brand guidelines for colors and typography',
        attachments: [{
          filename: 'brand-guidelines.pdf',
          path: '/attachments/brand-guidelines.pdf',
          uploadedAt: new Date()
        }]
      }),
      Comment.create({
        taskId: mainTask._id,
        userId: staffUser._id,
        content: 'I\'ll start with the hero section mockup today'
      })
    ]);
    console.log('Created comments for main task');

    // Create a task under review using TaskService
    const reviewTask = await TaskService.createTask({
      title: 'Update Privacy Policy',
      description: 'Update privacy policy to comply with new regulations',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      status: 'ongoing',
      projectId: sampleProject._id,
      assigneeId: staffUser._id,
      collaborators: [managerUser._id, staffUser._id]
    }, staffUser._id);

    // Staff submits work for review
    await TaskService.updateTask(reviewTask._id, {
      status: 'under_review'
    }, staffUser._id);
    console.log('Created review task:', reviewTask.title);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();