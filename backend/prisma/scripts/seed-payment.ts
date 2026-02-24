import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  //1. add payment permissions
  const payments = [{ name: 'payment.create' }, { name: 'payment.read' }];

  for (const p of payments) {
    await prisma.permissions.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
  }
  //.2 get user role
  const userRole = await prisma.roles.findUnique({
    where: { role: 'user' },
  });

  if (!userRole) throw new Error('Khong tim thay role user');

  //3. assign permissions to user role
  const permissionList = await prisma.permissions.findMany({
    where: {
      name: { in: payments.map((p) => p.name) },
    },
  });

  for (const p of permissionList) {
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
