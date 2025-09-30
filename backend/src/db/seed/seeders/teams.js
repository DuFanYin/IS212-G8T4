const Team = require('../../models/Team');

module.exports = async function seedTeams(_count, { departments }) {
  await Team.deleteMany({});
  const engineering = departments.find(d => d.name === 'Engineering') || departments[0];
  const operations = departments.find(d => d.name === 'Operations') || departments[1] || departments[0];
  const sales = departments.find(d => d.name === 'Sales') || departments[2] || departments[0];
  const hr = departments.find(d => d.name === 'HR') || departments[3] || departments[0];

  const docs = [
    { name: 'Platform Team', departmentId: engineering._id },
    { name: 'Frontend Team', departmentId: engineering._id },
    { name: 'Support Team', departmentId: operations._id },
    { name: 'Revenue Ops', departmentId: sales._id },
    { name: 'Account Executives', departmentId: sales._id },
    { name: 'People Ops', departmentId: hr._id },
  ];
  const inserted = await Team.insertMany(docs, { ordered: true });
  return inserted.map((t) => t.toObject());
};


