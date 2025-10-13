const Department = require('../../models/Department');

module.exports = async function seedDepartments(_count) {
  await Department.deleteMany({});
  const docs = [
    {
      name: 'Engineering',
      description: 'Software development and platform engineering',
    },
    {
      name: 'Operations',
      description: 'Business operations and support',
    },
  ];
  const inserted = await Department.insertMany(docs, { ordered: true });
  return inserted.map((d) => d.toObject());
};


