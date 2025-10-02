const Team = require('../../models/Team');

module.exports = async function seedTeams(_count, { departments }) {
  await Team.deleteMany({});
  const engineering = departments.find(d => d.name === 'Engineering') || departments[0];
  const operations = departments.find(d => d.name === 'Operations') || departments[1] || departments[0];
  const sales = departments.find(d => d.name === 'Sales') || departments[2] || departments[0];

  // 3 departments with 3, 2, 1 teams respectively
  const docs = [
    // Engineering (3 teams)
    { name: 'Platform Team', departmentId: engineering._id },
    { name: 'Frontend Team', departmentId: engineering._id },
    { name: 'QA Team', departmentId: engineering._id },
    // Operations (2 teams)
    { name: 'Support Team', departmentId: operations._id },
    { name: 'IT Ops', departmentId: operations._id },
    // Sales (1 team)
    { name: 'Account Executives', departmentId: sales._id },
  ];
  const inserted = await Team.insertMany(docs, { ordered: true });
  return inserted.map((t) => t.toObject());
};


