const { faker } = require('./faker');

const pick = (arr) => arr[faker.number.int({ min: 0, max: Math.max(0, arr.length - 1) })];
const range = (n) => Array.from({ length: n }, (_, i) => i);

function toDate(input) {
  if (input instanceof Date) return input;
  const n = typeof input === 'number' ? input : Date.parse(input);
  return new Date(Number.isFinite(n) ? n : Date.now());
}

function safeDateBetween(from, to, fallbackDays = 1) {
  const start = toDate(from).getTime();
  const end = toDate(to).getTime();
  const minGap = fallbackDays * 24 * 60 * 60 * 1000;
  const safeEnd = end <= start ? start + minGap : end;
  return faker.date.between({ from: new Date(start), to: new Date(safeEnd) });
}

const dateBetween = (start, end) => safeDateBetween(start, end);

module.exports = { pick, range, dateBetween, safeDateBetween };


