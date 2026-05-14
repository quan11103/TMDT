import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed...\n');

  // ─── PERMISSIONS ────────────────────────────────────────
  await prisma.permissions.createMany({
    data: [
      { name: 'user.read' },
      { name: 'user.create' },
      { name: 'user.update' },
      { name: 'user.delete' },
      { name: 'role.read' },
      { name: 'role.create' },
      { name: 'role.update' },
      { name: 'role.delete' },
      { name: 'category.create' },
      { name: 'category.update' },
      { name: 'category.delete' },
      { name: 'product.create' },
      { name: 'product.update' },
      { name: 'product.delete' },
      { name: 'order.read' },
      { name: 'order.update' },
      { name: 'banner.read' },
      { name: 'banner.create' },
      { name: 'banner.update' },
      { name: 'banner.delete' },
      { name: 'store_settings.update' },
      { name: 'promotion.read' },
      { name: 'promotion.update' },
      { name: 'promotion.create' },
      { name: 'promotion.delete' },
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

  const customerRole = await prisma.roles.upsert({
    where: { role: 'customer' },
    update: {},
    create: { role: 'customer' },
  });

  await prisma.role_permission.createMany({
    data: allPermissions.map((p) => ({
      role_id: adminRole.id,
      permission_id: p.id,
    })),
    skipDuplicates: true,
  });

  console.log(`✅ Roles + permissions`);

  // ─── USERS ──────────────────────────────────────────────
  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || '123456',
    10,
  );
  const customerPassword = await bcrypt.hash('123456', 10);

  await prisma.users.upsert({
    where: { email: 'admin@gmail.com' },
    update: { password: adminPassword },
    create: {
      email: 'admin@gmail.com',
      password: adminPassword,
      full_name: 'Admin',
      role_id: adminRole.id,
    },
  });

  await prisma.users.upsert({
    where: { email: 'customer1@gmail.com' },
    update: {},
    create: {
      email: 'customer1@gmail.com',
      password: customerPassword,
      full_name: 'Nguyễn Văn An',
      phone: '0901234567',
      gender: 'Nam',
      dob: new Date('1999-05-15'),
      role_id: customerRole.id,
    },
  });

  await prisma.users.upsert({
    where: { email: 'customer2@gmail.com' },
    update: {},
    create: {
      email: 'customer2@gmail.com',
      password: customerPassword,
      full_name: 'Trần Thị Bình',
      phone: '0907654321',
      gender: 'Nữ',
      dob: new Date('2001-08-20'),
      role_id: customerRole.id,
    },
  });

  await prisma.users.upsert({
    where: { email: 'customer3@gmail.com' },
    update: {},
    create: {
      email: 'customer3@gmail.com',
      password: customerPassword,
      full_name: 'Lê Hoàng Minh',
      phone: '0912345678',
      gender: 'Nam',
      dob: new Date('1995-12-01'),
      role_id: customerRole.id,
    },
  });

  console.log(`✅ 4 users (1 admin, 3 customers)`);

  // ─── CATEGORIES ─────────────────────────────────────────
  const catBut = await prisma.categories.upsert({
    where: { slug: 'but-viet' },
    update: {},
    create: { name: 'Bút viết', slug: 'but-viet' },
  });

  const catGiay = await prisma.categories.upsert({
    where: { slug: 'giay-va-so' },
    update: {},
    create: { name: 'Giấy & Sổ', slug: 'giay-va-so' },
  });

  const catDungCu = await prisma.categories.upsert({
    where: { slug: 'dung-cu-van-phong' },
    update: {},
    create: { name: 'Dụng cụ văn phòng', slug: 'dung-cu-van-phong' },
  });

  const catMucIn = await prisma.categories.upsert({
    where: { slug: 'muc-in-va-muc-may' },
    update: {},
    create: { name: 'Mực in & Mực máy', slug: 'muc-in-va-muc-may' },
  });

  const catBalo = await prisma.categories.upsert({
    where: { slug: 'balo-va-tui' },
    update: {},
    create: { name: 'Balo & Túi', slug: 'balo-va-tui' },
  });

  const catButBi = await prisma.categories.upsert({
    where: { slug: 'but-bi' },
    update: {},
    create: { name: 'Bút bi', slug: 'but-bi', parent_id: catBut.id },
  });

  const catButChi = await prisma.categories.upsert({
    where: { slug: 'but-chi' },
    update: {},
    create: { name: 'Bút chì', slug: 'but-chi', parent_id: catBut.id },
  });

  const catButDa = await prisma.categories.upsert({
    where: { slug: 'but-da' },
    update: {},
    create: {
      name: 'Bút dạ & Highlight',
      slug: 'but-da',
      parent_id: catBut.id,
    },
  });

  const catButLong = await prisma.categories.upsert({
    where: { slug: 'but-long' },
    update: {},
    create: { name: 'Bút lông', slug: 'but-long', parent_id: catBut.id },
  });

  const catVo = await prisma.categories.upsert({
    where: { slug: 'vo-ghi-chu' },
    update: {},
    create: { name: 'Vở ghi chú', slug: 'vo-ghi-chu', parent_id: catGiay.id },
  });

  const catGiayIn = await prisma.categories.upsert({
    where: { slug: 'giay-in' },
    update: {},
    create: { name: 'Giấy in', slug: 'giay-in', parent_id: catGiay.id },
  });

  const catSoTay = await prisma.categories.upsert({
    where: { slug: 'so-tay-planner' },
    update: {},
    create: {
      name: 'Sổ tay & Planner',
      slug: 'so-tay-planner',
      parent_id: catGiay.id,
    },
  });

  console.log(`✅ 12 categories (5 cha, 7 con)`);

  // ─── PRODUCTS + IMAGES ──────────────────────────────────
  // Dùng ảnh từ Unsplash — free, không cần API key
  // Format: https://images.unsplash.com/photo-{id}?w=800&q=80
  // is_main: true → ảnh đại diện hiển thị ở danh sách
  // is_main: false → ảnh phụ hiển thị trong gallery chi tiết

  const productsData = [
    // ── Bút bi ──────────────────────────────────────────
    {
      name: 'Bút bi Thiên Long TL-027',
      slug: 'but-bi-thien-long-tl-027',
      price: 5000,
      stock: 500,
      category_id: catButBi.id,
      description:
        'Bút bi ngòi 0.7mm, mực xanh, viết trơn tru bền bỉ. Thích hợp cho học sinh và văn phòng.',
      images: [
        {
          url: 'https://product.hstatic.net/1000230347/product/artboard_6_993a955c7bc34ed983cf23d627053848.jpg',
          is_main: true,
        },
        {
          url: 'https://product.hstatic.net/1000230347/product/artboard_11_08a7991536a1403f8ae5374e14b8a7f1.jpg',
          is_main: false,
        },
        {
          url: 'https://product.hstatic.net/1000230347/product/artboard_13_e376a63784904b7281d9acc560594660.jpg',
          is_main: false,
        },
      ],
    },
    {
      name: 'Bút bi Pentel BK77',
      slug: 'but-bi-pentel-bk77',
      price: 15000,
      stock: 200,
      category_id: catButBi.id,
      description:
        'Bút bi Nhật Bản cao cấp, ngòi 0.7mm, mực xanh đen đậm nét, thân grip cao su chống trơn.',
      images: [
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lzbu5z7helhpf1.webp',
          is_main: true,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/0575112a076064a6c93f8ec2cb240c66.webp',
          is_main: false,
        },
      ],
    },
    {
      name: 'Bút bi Pilot BP-S',
      slug: 'but-bi-pilot-bp-s',
      price: 12000,
      stock: 300,
      category_id: catButBi.id,
      description:
        'Bút bi Nhật Bản thương hiệu Pilot, viết mượt, không lem mực, nắp đậy chắc chắn.',
      images: [
        {
          url: 'https://down-vn.img.susercontent.com/file/sg-11134201-7rdyo-lxyikizdy4aw38.webp',
          is_main: true,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/sg-11134201-7rdyp-lxyikjq0v55672.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/sg-11134201-7rdxj-lxyikkj5oibubc.webp',
          is_main: false,
        },
      ],
    },
    {
      name: 'Set 10 bút bi Thiên Long TL-027',
      slug: 'set-10-but-bi-thien-long',
      price: 45000,
      stock: 150,
      category_id: catButBi.id,
      description:
        'Combo 10 bút bi Thiên Long TL-027 tiết kiệm. Gồm 5 xanh, 3 đỏ, 2 đen.',
      images: [
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-me6pi7vufx8jc2.webp',
          is_main: true,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-me6pi7si9k3p3d.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-me6pi7t4b6yq26.webp',
          is_main: false,
        },
      ],
    },

    // ── Bút chì ─────────────────────────────────────────
    {
      name: 'Bút chì Staedtler 2B',
      slug: 'but-chi-staedtler-2b',
      price: 8000,
      stock: 400,
      category_id: catButChi.id,
      description:
        'Bút chì gỗ Staedtler độ cứng 2B, phù hợp vẽ kỹ thuật và phác thảo nghệ thuật.',
      images: [
        {
          url: 'https://down-vn.img.susercontent.com/file/sg-11134201-22100-l9tuqzb857iv8c.webp',
          is_main: true,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mg61rqo33bil3d.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mg61rkrn7cw920.webp',
          is_main: false,
        },
      ],
    },
    {
      name: 'Bút chì kim Pentel 0.5mm',
      slug: 'but-chi-kim-pentel-0-5mm',
      price: 25000,
      stock: 180,
      category_id: catButChi.id,
      description:
        'Bút chì kim bấm Pentel, ngòi 0.5mm, thân nhựa cao cấp, grip chống trơn.',
      images: [
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lg34n1ob19tj8a.webp',
          is_main: true,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lmwobkt7uy1rdc.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lmwobkt7wcm746.webp',
          is_main: false,
        },
      ],
    },
    {
      name: 'Set 12 bút chì màu Faber-Castell',
      slug: 'set-12-but-chi-mau-faber-castell',
      price: 65000,
      stock: 120,
      category_id: catButChi.id,
      description:
        'Hộp 12 màu bút chì Faber-Castell, ruột chì mềm màu tươi sáng.',
      images: [
        {
          url: 'https://cdn1.fahasa.com/media/catalog/product/4/0/4005401158530.jpg',
          is_main: true,
        },
        {
          url: 'https://cdn1.fahasa.com/media/catalog/product/4/0/4005401158530-_4_.jpg',
          is_main: false,
        },
        {
          url: 'https://cdn1.fahasa.com/media/catalog/product/4/0/4005401158530-_6_.jpg',
          is_main: false,
        },
      ],
    },

    // ── Bút dạ & Highlight ───────────────────────────────
    {
      name: 'Bút dạ quang Stabilo Boss vàng',
      slug: 'but-da-quang-stabilo-boss-vang',
      price: 18000,
      stock: 250,
      category_id: catButDa.id,
      description:
        'Bút highlight Stabilo màu vàng, mực huỳnh quang, không lem không nhòe.',
      images: [
        {
          url: 'https://down-vn.img.susercontent.com/file/5a52ad28e79ab63d9baeb607a26c18f9.webp',
          is_main: true,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/69346c5067d71dbd96af1e611090c68b.webp',
          is_main: false,
        },
      ],
    },
    {
      name: 'Bộ 6 bút dạ quang Stabilo Boss',
      slug: 'bo-6-but-da-quang-stabilo-boss',
      price: 95000,
      stock: 100,
      category_id: catButDa.id,
      description:
        'Set 6 màu Stabilo Boss: vàng, xanh lá, hồng, cam, xanh dương, tím.',
      images: [
        {
          url: 'https://bizweb.dktcdn.net/thumb/grande/100/364/545/products/hl70-c6.jpg',
          is_main: true,
        },
        {
          url: 'https://bizweb.dktcdn.net/100/364/545/products/hl70-1-20afa724-7245-4030-84d2-0c7f80f2ade9.jpg?v=1704860050003',
          is_main: false,
        },
        {
          url: 'https://bizweb.dktcdn.net/100/364/545/products/hl703016bee5ecb5c420cb9729f533-3d67ea50-a851-4b88-b5fb-1d0ed4115334-4d5f8daf-cb4c-4a81-b54b-eb0027666eca.jpg?v=1704860050003',
          is_main: false,
        },
      ],
    },

    // ── Bút lông ────────────────────────────────────────
    {
      name: 'Bút lông bảng Artline 577',
      slug: 'but-long-bang-artline-577',
      price: 20000,
      stock: 150,
      category_id: catButLong.id,
      description:
        'Bút lông viết bảng trắng Artline, mực dễ xóa, ngòi đầu tròn 3mm.',
      images: [
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-mb52t301uva0cd.webp',
          is_main: true,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-mb52t30bugns33.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-mb52t30buggn2d.webp',
          is_main: false,
        },
      ],
    },
    {
      name: 'Bộ 4 bút lông bảng Artline',
      slug: 'bo-4-but-long-bang-artline',
      price: 75000,
      stock: 80,
      category_id: catButLong.id,
      description: 'Set 4 bút lông bảng Artline 577: đen, xanh, đỏ, xanh lá.',
      images: [
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lze5u2kr0ty980.webp',
          is_main: true,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lze5xsf75m7586.webp',
          is_main: false,
        },
      ],
    },

    // ── Vở ghi chú ──────────────────────────────────────
    {
      name: 'Vở kẻ ngang Hồng Hà 200 trang',
      slug: 'vo-ke-ngang-hong-ha-200-trang',
      price: 22000,
      stock: 300,
      category_id: catVo.id,
      description:
        'Vở học sinh Hồng Hà 200 trang, giấy trắng kẻ ngang, bìa cứng chống thấm.',
      images: [
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mlbqis6tj7603f.webp',
          is_main: true,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-ml76rfkiv5kybe.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mesa755szc3kb0.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mesaew8fxmo504.webp',
          is_main: false,
        },
      ],
    },
    {
      name: 'Vở ô ly Hồng Hà 100 trang',
      slug: 'vo-o-ly-hong-ha-100-trang',
      price: 12000,
      stock: 400,
      category_id: catVo.id,
      description:
        'Vở ô ly Hồng Hà 100 trang, dành cho học sinh tiểu học, giấy trắng mịn.',
      images: [
        {
          url: 'https://bizweb.dktcdn.net/thumb/1024x1024/100/334/874/products/vo-4-ly-ngang-hong-ha-0751-4.jpg?v=1741319909060',
          is_main: true,
        },
        {
          url: 'https://bizweb.dktcdn.net/100/334/874/products/tap-4-ly-ngang-100-hong-ha-dinh-luong-58gsm-0751-3.jpg?v=1741319909060',
          is_main: false,
        },
        {
          url: 'https://bizweb.dktcdn.net/100/334/874/products/tap-4-ly-ngang-100-hong-ha-dinh-luong-58gsm-0751-5.jpg?v=1741319909060',
          is_main: false,
        },
        {
          url: 'https://bizweb.dktcdn.net/100/334/874/products/tap-4-ly-ngang-100-hong-ha-dinh-luong-58gsm-0751-6.jpg?v=1741319909060',
          is_main: false,
        },
      ],
    },

    // ── Sổ tay & Planner ────────────────────────────────
    {
      name: 'Sổ tay A5 bìa cứng',
      slug: 'so-tay-a5-bia-cung',
      price: 35000,
      stock: 150,
      category_id: catSoTay.id,
      description:
        'Sổ tay A5 120 trang, bìa cứng chống thấm, giấy dày 80gsm không thấm mực.',
      images: [
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mgrq1c0ykj6625.webp',
          is_main: true,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mgenh3mih2bs70.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mgenh3qjb6dl46.webp',
          is_main: false,
        },
      ],
    },
    {
      name: 'Sổ planner 2026 bìa da PU',
      slug: 'so-planner-2026-bia-da-pu',
      price: 120000,
      stock: 80,
      category_id: catSoTay.id,
      description:
        'Sổ kế hoạch 2026, layout ngày/tuần/tháng đầy đủ, bìa da PU cao cấp.',
      images: [
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mj50ossvw1s0a9.webp',
          is_main: true,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mgew5flliiobd7.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mfwdpofq39ccf3.webp',
          is_main: false,
        },
      ],
    },
    {
      name: 'Sổ bullet journal dotted A5',
      slug: 'so-bullet-journal-dotted-a5',
      price: 85000,
      stock: 60,
      category_id: catSoTay.id,
      description:
        'Sổ bullet journal A5 dotted 160 trang, giấy dày 120gsm, bìa cứng.',
      images: [
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-mas6no1t9pefd4.webp',
          is_main: true,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lxm9f7v3cqu3d8.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/4777489c0e0a2cef4a030235fbb69764.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/9bb1d057526033bfb7417a7271ecb5ad.webp',
          is_main: false,
        },
      ],
    },

    // ── Giấy in ─────────────────────────────────────────
    {
      name: 'Giấy in Double A A4 70gsm',
      slug: 'giay-in-double-a-a4-70gsm',
      price: 85000,
      stock: 200,
      category_id: catGiayIn.id,
      description:
        'Giấy in Double A A4 định lượng 70gsm, 500 tờ/ream, độ trắng cao.',
      images: [
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lkxub0nryhfv62.webp',
          is_main: true,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/3a250c6318ec8ae5c4c69c79b4adf9dc.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/9adafdd3a63ec3f38f140dd796fd1ba2.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/sg-11134253-824ho-mfr0gager6ku23.webp',
          is_main: false,
        },
      ],
    },
    {
      name: 'Giấy in IK Yellow A4 80gsm',
      slug: 'giay-in-ik-yellow-a4-80gsm',
      price: 95000,
      stock: 150,
      category_id: catGiayIn.id,
      description:
        'Giấy in IK Yellow A4 định lượng 80gsm, 500 tờ/ream, độ trắng 96%.',
      images: [
        {
          url: 'https://down-vn.img.susercontent.com/file/8bb66e4e861981771f45798d6e35b27e.webp',
          is_main: true,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/f3ed6d15be6f2380fb5a7a6635d4917a.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/56afdc270059a53ff0365d4964c1d635.webp',
          is_main: false,
        },
      ],
    },

    // ── Dụng cụ văn phòng ───────────────────────────────
    {
      name: 'Bấm kim Deli số 10',
      slug: 'bam-kim-deli-so-10',
      price: 35000,
      stock: 100,
      category_id: catDungCu.id,
      description: 'Bấm kim Deli dùng kim số 10, bấm được 20 tờ cùng lúc.',
      images: [
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m0jpb5t6sxd903.webp',
          is_main: true,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lz5xqldxs97la5.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lz5xqlerr13h79.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lz5xql3y6v65aa.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lz5xql4s5nbh38.webp',
          is_main: false,
        },
      ],
    },
    {
      name: 'Kéo văn phòng Deli 21cm',
      slug: 'keo-van-phong-deli-21cm',
      price: 28000,
      stock: 120,
      category_id: catDungCu.id,
      description:
        'Kéo inox Deli 21cm, lưỡi sắc bén không gỉ, cán nhựa nhám êm tay.',
      images: [
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lmwkpt22hfbzb4.webp',
          is_main: true,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-ljcrsxyplp76ea.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-ljcrsxypkamqb3.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-ljcrsxypiw2a17.webp',
          is_main: false,
        },
      ],
    },
    {
      name: 'Băng keo trong 3M Scotch 18mm',
      slug: 'bang-keo-trong-3m-scotch-18mm',
      price: 22000,
      stock: 200,
      category_id: catDungCu.id,
      description:
        'Băng keo trong 3M Scotch 18mm x 33m, dính chắc, trong suốt.',
      images: [
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ltxmbjgdj5shb7.webp',
          is_main: true,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ltxmbjg38c9rd1.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ltxmbjgdhr8142.webp',
          is_main: false,
        },
      ],
    },
    {
      name: 'Ghim bấm Deli hộp 1000 cái',
      slug: 'ghim-bam-deli-hop-1000-cai',
      price: 15000,
      stock: 300,
      category_id: catDungCu.id,
      description: 'Hộp 1000 ghim bấm Deli số 10, thép không gỉ, không kẹt.',
      images: [
        {
          url: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-u6ngxbow0flvce.webp',
          is_main: true,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-h16mh8nw0flvb1.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-79ffrcow0flvaa.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/sg-11134201-22120-qkaitaow0flvb4.webp',
          is_main: false,
        },
      ],
    },

    // ── Mực in ──────────────────────────────────────────
    {
      name: 'Hộp mực in Canon 325',
      slug: 'hop-muc-in-canon-325',
      price: 350000,
      stock: 50,
      category_id: catMucIn.id,
      description:
        'Hộp mực in Canon 325 chính hãng, dùng cho Canon LBP6000/6030.',
      images: [
        {
          url: 'https://lh3.googleusercontent.com/Y5vv9fyO79raLm4peCxuM3McsWLGY-wCZTw9XZHJ_2IAz6EtM8dpXXY_h-OaOQIo9D8qlsXTo2IOan51E-k=rw',
          is_main: true,
        },
        {
          url: 'https://lh3.googleusercontent.com/uLChMZwkp7OxUp5BtK-wMkBmN6liPM-brDQKDVWQvk6dM8_mNn3xEFb7tUSn-TNAmDEwRIcDjxJzowLxQ4o=rw',
          is_main: false,
        },
      ],
    },
    {
      name: 'Hộp mực in HP 85A CE285A',
      slug: 'hop-muc-in-hp-85a-ce285a',
      price: 420000,
      stock: 40,
      category_id: catMucIn.id,
      description:
        'Hộp mực HP 85A CE285A chính hãng, dùng cho HP LaserJet P1102.',
      images: [
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mf0zvn8t4ufjbc.webp',
          is_main: true,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-metjx6to80eefc.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mmn0mvpxw0lf82.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mmn0mvpxxf5v30.webp',
          is_main: false,
        },
      ],
    },

    // ── Balo & Túi ──────────────────────────────────────
    {
      name: 'Balo học sinh Herschel 20L',
      slug: 'balo-hoc-sinh-herschel-20l',
      price: 850000,
      stock: 30,
      category_id: catBalo.id,
      description:
        'Balo Herschel 20L, chất liệu canvas cao cấp, ngăn laptop 15 inch.',
      images: [
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-820l4-miwilagh4gzp75.webp',
          is_main: true,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m7x79i6rp2f669.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m7x78dezfsqs18.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m7x78dezczlwe1.webp',
          is_main: false,
        },
      ],
    },
    {
      name: 'Túi đựng bút canvas',
      slug: 'tui-dung-but-canvas',
      price: 55000,
      stock: 100,
      category_id: catBalo.id,
      description: 'Túi đựng bút canvas nhiều ngăn, sức chứa 20-30 bút.',
      images: [
        {
          url: 'https://down-vn.img.susercontent.com/file/72a05dac88e0067d0fc2ac040ea78160.webp',
          is_main: true,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/f855cc98280ecf27da57c3949d3fbc86.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/0651ba7170bbecd8ef3c61e4c45cb797.webp',
          is_main: false,
        },
        {
          url: 'https://down-vn.img.susercontent.com/file/b0917dcf3918648cd5d044cb38c5c28a.webp',
          is_main: false,
        },
      ],
    },
  ];

  // Tạo product + images trong 1 vòng lặp
  // Dùng create thay vì upsert vì product_images không có unique field để upsert
  let productCount = 0;
  let imageCount = 0;

  for (const { images, ...productData } of productsData) {
    // Upsert product
    const product = await prisma.products.upsert({
      where: { slug: productData.slug },
      update: {},
      create: productData,
    });

    // Xóa ảnh cũ và tạo ảnh mới để cập nhật theo dữ liệu seed mới nhất
    await prisma.product_images.deleteMany({
      where: { product_id: product.id },
    });

    await prisma.product_images.createMany({
      data: images.map((img) => ({
        product_id: product.id,
        image_url: img.url,
        is_main: img.is_main,
      })),
    });
    imageCount += images.length;

    productCount++;
  }

  console.log(`✅ ${productCount} products + ${imageCount} images`);

  await prisma.promotions.upsert({
    where: { code: 'TESTALL10' },
    update: {},
    create: {
      code: 'TESTALL10',
      discount_type: 'PERCENT',
      discount_value: 10,
      product_scope: 'ALL',
      starts_at: new Date('2026-01-01'),
      ends_at: new Date('2026-12-31'),
      is_active: true,
    },
  });
  await prisma.promotions.upsert({
    where: { code: 'TESTCAT5K' },
    update: {},
    create: {
      code: 'TESTCAT5K',
      discount_type: 'FIXED_AMOUNT',
      discount_value: 5000,
      product_scope: 'CATEGORY',
      category_id: catBut.id, // đổi theo biến category có trong seed của bạn
      starts_at: new Date('2026-01-01'),
      ends_at: new Date('2026-12-31'),
      is_active: true,
    },
  });

  await prisma.promotions.upsert({
    where: { code: 'TESTPROD15' },
    update: {
      /* optional */
    },
    create: {
      code: 'TESTPROD15',
      discount_type: 'PERCENT',
      discount_value: 15,
      product_scope: 'PRODUCT',
      starts_at: new Date('2026-01-01'),
      ends_at: new Date('2026-12-31'),
      is_active: true,
      promotion_products: {
        create: [{ product_id: 1 }, { product_id: 5 }, { product_id: 12 }],
      },
    },
  });

  // ─── TỔNG KẾT ───────────────────────────────────────────
  console.log('\n' + '─'.repeat(45));
  console.log('🌱 SEED HOÀN TẤT!\n');
  console.log('📋 Tài khoản test:');
  console.log('   Admin:     admin@gmail.com / 123456');
  console.log('   Customer1: customer1@gmail.com / 123456');
  console.log('   Customer2: customer2@gmail.com / 123456');
  console.log('   Customer3: customer3@gmail.com / 123456');
  console.log('─'.repeat(45));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
