import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Example: Create a test hippodrome
  const hippodrome = await prisma.hippodrome.upsert({
    where: { code: 'CHA' },
    update: {},
    create: {
      code: 'CHA',
      name: 'CHANTILLY',
      countryCode: 'FRA',
    },
  });

  console.log('✅ Created hippodrome:', hippodrome.name);

  // Add more seed data here as needed
  // This is just a placeholder - actual seeding will be done via API sync

  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
