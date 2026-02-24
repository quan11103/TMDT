import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orderPermissions = [
    { name: 'order.read' },
    { name: 'order.create' },
    { name: 'order.cancel' },
  ];

  for (const p of orderPermissions) {
    await prisma.permissions.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
  }

  console.log('add order permissions success');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
