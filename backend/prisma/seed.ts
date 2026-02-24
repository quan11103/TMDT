import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.permissions.createMany({
    data: [
      { name: 'user.read' },
      { name: 'user.create' },
      { name: 'user.update' },
      { name: 'user.delete' },
      { name: 'product.read' },
      { name: 'product.create' },
      { name: 'product.update' },
      { name: 'product.delete' },
      { name: 'order.manage' },
    ],
    skipDuplicates: true,
  });

  const adminRole = await prisma.roles.upsert({
    where: { role: 'admin' },
    update: {},
    create: { role: 'admin' },
  });

  const userRole = await prisma.roles.upsert({
    where: { role: 'user' },
    update: {},
    create: { role: 'user' },
  });

  const allPermissions = await prisma.permissions.findMany();

  for (const p of allPermissions) {
    await prisma.role_permission.upsert({
      where: {
        role_id_permission_id: {
          role_id: adminRole.id,
          permission_id: p.id,
        },
      },
      update: {},
      create: {
        role_id: adminRole.id,
        permission_id: p.id,
      },
    });
  }

  const userPermissions = ['product.read', 'order.manage'];

  const permissions = await prisma.permissions.findMany({
    where: {
      name: { in: userPermissions },
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

  const hashedPassword = await bcrypt.hash('123456', 10);

  await prisma.users.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      password: hashedPassword,
      full_name: 'Admin',
      role_id: adminRole.id,
    },
  });

  console.log('SEED DONE');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
