require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./connect');
const { User, Task, Project } = require('./models');

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Task.deleteMany({}),
      Project.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create a sample user
    const sampleUser = await User.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'manager'
    });
    console.log('Created sample user:', sampleUser.email);

    // Create a sample project
    const sampleProject = await Project.create({
      name: 'Website Redesign',
      description: 'Redesign company website with modern UI/UX',
      ownerId: sampleUser._id,
      collaborators: [sampleUser._id]
    });
    console.log('Created sample project:', sampleProject.name);

    // Create a sample task
    const sampleTask = await Task.create({
      title: 'Design Homepage',
      description: 'Create new homepage design with modern aesthetics',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'in_progress',
      ownerId: sampleUser._id,
      assigneeId: sampleUser._id,
      projectId: sampleProject._id,
      notes: 'Focus on mobile-first design',
      collaborators: [sampleUser._id]
    });
    console.log('Created sample task:', sampleTask.title);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
