const { faker } = require('./faker');

const pick = (arr) => arr[Math.floor(faker.number.float({ min: 0, max: arr.length - 1, precision: 1 }))];
const range = (n) => Array.from({ length: n }, (_, i) => i);
const dateBetween = (start, end) => faker.date.between({ from: start, to: end });

module.exports = { pick, range, dateBetween };


