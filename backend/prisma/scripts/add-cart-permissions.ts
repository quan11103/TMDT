import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const permissions = [
    {
      name: 'cart.read',
    },
    {
      name: 'cart.update',
    },
  ];

  for (const p of permissions) {
    await prisma.permissions.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
  }

  console.log('Cart permissions added');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
