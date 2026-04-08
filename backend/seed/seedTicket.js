const sequelize = require('../config/db');
const Ticket = require('../models/ticket');
const Organization = require('../models/org');
const User = require('../models/user');
const { faker } = require('@faker-js/faker');

const DEFAULT_SEED_COUNT = 10000;
const DEFAULT_CHUNK_SIZE = 500;

const seedTicketsForOrg = async ({ orgId, userId, count = DEFAULT_SEED_COUNT, chunkSize = DEFAULT_CHUNK_SIZE }) => {
    const finalCount = Math.min(Number(count) || DEFAULT_SEED_COUNT, 20000);
    const finalChunkSize = Math.min(Number(chunkSize) || DEFAULT_CHUNK_SIZE, 2000);

    let inserted = 0;
    for (let i = 0; i < finalCount; i += finalChunkSize) {
        const size = Math.min(finalChunkSize, finalCount - i);
        const ticketsChunk = Array.from({ length: size }).map(() => ({
            title: `${faker.hacker.phrase()} #${faker.string.uuid()}`,
            description: faker.lorem.paragraphs(2),
            severity: faker.helpers.arrayElement(['Low', 'Medium', 'High', 'Critical']),
            status: faker.helpers.arrayElement(['Open', 'Investigating', 'Mitigated', 'Resolved']),
            tags: [faker.hacker.noun(), faker.hacker.adjective()],
            org_id: orgId,
            created_by: userId,
            assigned_to: userId,
            createdAt: faker.date.past({ years: 1 }),
            updatedAt: new Date(),
        }));

        await Ticket.bulkCreate(ticketsChunk);
        inserted += size;
    }

    return { inserted };
};

if (require.main === module) {
    (async () => {
        try {
            await sequelize.authenticate();
            console.log('Database connected...');

            const count = process.env.SEED_COUNT ? Number(process.env.SEED_COUNT) : DEFAULT_SEED_COUNT;
            const orgId = process.env.ORG_ID ? Number(process.env.ORG_ID) : null;
            const userId = process.env.USER_ID ? Number(process.env.USER_ID) : null;

            const org = orgId ? await Organization.findByPk(orgId) : await Organization.findOne();
            const user = userId ? await User.findByPk(userId) : await User.findOne();

            if (!org || !user) {
                console.error('Please run your server and create at least one Org/User first!');
                process.exit(1);
            }

            console.log(`Seeding ${count} tickets for Org: ${org.name}...`);
            const result = await seedTicketsForOrg({ orgId: org.id, userId: user.id, count });
            console.log(`Seeding completed successfully! Inserted: ${result.inserted}`);
            process.exit(0);
        } catch (error) {
            console.error('Seeding failed:', error);
            process.exit(1);
        }
    })();
}

module.exports = { seedTicketsForOrg };
