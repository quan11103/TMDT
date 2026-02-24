import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const cartPermissions = ['cart.read', 'cart.update'];

  const userRole = await prisma.roles.findUnique({
    where: { role: 'user' },
  });

  if (!userRole) throw new Error('this role not found');

  const permissions = await prisma.permissions.findMany({
    where: {
      name: { in: cartPermissions },
    },
  });

  for (const p of permissions) {
    await prisma.role_permission.upsert({
      where: {
        role_id_permission_id: {
          role_id: userRole.id,
          permission_id: p.id,
        },
      },
      update: {},
      create: {
        role_id: userRole.id,
        permission_id: p.id,
      },
    });
  }

  console.log('assign cart permissions success');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
