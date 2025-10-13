const Team = require('../../models/Team');

module.exports = async function seedTeams(_count, { departments }) {
  await Team.deleteMany({});
  const engineering = departments.find(d => d.name === 'Engineering') || departments[0];
  const operations = departments.find(d => d.name === 'Operations') || departments[1] || departments[0];

  // 2 departments with 2 teams each
  const docs = [
    // Engineering
    { name: 'Platform Team', departmentId: engineering._id },
    { name: 'Frontend Team', departmentId: engineering._id },
    // Operations
    { name: 'Support Team', departmentId: operations._id },
    { name: 'IT Ops', departmentId: operations._id },
  ];
  const inserted = await Team.insertMany(docs, { ordered: true });
  return inserted.map((t) => t.toObject());
};


