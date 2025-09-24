const { Faker, en } = require('@faker-js/faker');

const seedValue = parseInt(process.env.SEED_RANDOM || '1337', 10) || 1337;
const faker = new Faker({ locale: [en] });
faker.seed(seedValue);

module.exports = { faker };


