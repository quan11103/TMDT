import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  //---PERMISSIONS------------
  await prisma.permissions.createMany({
    data: [
      // User
      { name: 'user.read' },
      { name: 'user.create' },
      { name: 'user.update' },
      { name: 'user.delete' },
      // Roles
      { name: 'role.read' },
      { name: 'role.create' },
      { name: 'role.update' },
      { name: 'role.delete' },
      // Categories
      { name: 'category.create' },
      { name: 'category.update' },
      { name: 'category.delete' },
      //Products
      { name: 'product.create' },
      { name: 'product.update' },
      { name: 'product.delete' },
      // Orders
      { name: 'order.read' },
      { name: 'order.update' },
    ],
    skipDuplicates: true,
  });

  const allPermissions = await prisma.permissions.findMany();
  console.log(`✅ ${allPermissions.length} permissions`);
  // ─── ROLES ──────────────────────────────────────────────
  const adminRole = await prisma.roles.upsert({
    where: { role: 'admin' },
    update: {},
    create: { role: 'admin' },
  });

  // ← đổi 'user' thành 'customer'
  const customerRole = await prisma.roles.upsert({
    where: { role: 'customer' },
    update: {},
    create: { role: 'customer' },
  });

  console.log(
    ` ✅ Roles: admin (${adminRole.id}), customer (${customerRole.id})`,
  );

  // ─── ADMIN PERMISSIONS (tất cả) ─────────────────────────
  // Dùng createMany thay vì loop để tránh N+1 query
  await prisma.role_permission.createMany({
    data: allPermissions.map((p) => ({
      role_id: adminRole.id,
      permission_id: p.id,
    })),
    skipDuplicates: true,
  });

  // ─── ADMIN USER ─────────────────────────────────────────
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || '123456',
    10,
  );

  await prisma.users.upsert({
    where: { email: 'admin@gmail.com' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@gmail.com',
      password: hashedPassword,
      full_name: 'Admin',
      role_id: adminRole.id,
    },
  });
  console.log(`✅ Admin user: admin@gmail.com`);
  console.log('🌱 SEED DONE');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
