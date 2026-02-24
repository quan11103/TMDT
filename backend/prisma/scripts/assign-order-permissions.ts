import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orderPermissions = ['order.read', 'order.create', 'order.cancel'];

  const userRole = await prisma.roles.findUnique({
    where: { role: 'user' },
  });

  if (!userRole) throw new Error('khong co role nay');

  const permissions = await prisma.permissions.findMany({
    where: {
      name: { in: orderPermissions },
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
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
