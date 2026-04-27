import { PrismaClient, MembershipType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const passwordHash = await bcrypt.hash('changeme', 10);
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });

  // Create branches
  const branches = await Promise.all([
    prisma.branch.upsert({
      where: { slug: 'baizakova' },
      update: {},
      create: {
        slug: 'baizakova',
        name: 'Байзакова',
        address: 'Байзакова 280, 3 этаж',
        phone: '+77752899276',
        managerPhone: '+77752899276',
        workingHours: '07:00-23:00',
      },
    }),
    prisma.branch.upsert({
      where: { slug: 'kozhamkulova' },
      update: {},
      create: {
        slug: 'kozhamkulova',
        name: 'Кожамкулова',
        address: 'Кожамкулова 136',
        phone: '+77774702979',
        managerPhone: '+77774702979',
        workingHours: '07:00-23:00',
      },
    }),
    prisma.branch.upsert({
      where: { slug: 'kabanbay' },
      update: {},
      create: {
        slug: 'kabanbay',
        name: 'Кабанбай батыра',
        address: 'Кабанбай батыра 147',
        phone: '+77475806137',
        managerPhone: '+77475806137',
        workingHours: '07:00-23:00',
      },
    }),
    prisma.branch.upsert({
      where: { slug: 'makataeva' },
      update: {},
      create: {
        slug: 'makataeva',
        name: 'Макатаева',
        address: 'Макатаева 45, 3 этаж',
        phone: '+77478125425',
        managerPhone: '+77478125425',
        workingHours: '07:00-23:00',
      },
    }),
  ]);

  const [baizakova, kozhamkulova, kabanbay, makataeva] = branches;

  // Seed memberships for all branches
  const membershipData: Array<{
    branchId: number;
    name: string;
    type: MembershipType;
    durationMonths: number;
    price: number;
    timeRange: string | null;
    displayOrder: number;
  }> = [
    // Байзакова
    { branchId: baizakova.id, name: '12 занятий (утро)', type: 'VISITS_12_MORNING', durationMonths: 1, price: 24000, timeRange: '07:00–17:00', displayOrder: 1 },
    { branchId: baizakova.id, name: '12 занятий (полный день)', type: 'VISITS_12_FULL', durationMonths: 1, price: 27000, timeRange: '07:00–23:00', displayOrder: 2 },
    { branchId: baizakova.id, name: 'Безлимит (утро)', type: 'UNLIMITED_MORNING', durationMonths: 1, price: 25000, timeRange: '07:00–17:00', displayOrder: 3 },
    { branchId: baizakova.id, name: 'Безлимит (полный день)', type: 'UNLIMITED_FULL', durationMonths: 1, price: 30000, timeRange: '07:00–23:00', displayOrder: 4 },
    { branchId: baizakova.id, name: '3 месяца', type: 'MONTHS_3', durationMonths: 3, price: 70000, timeRange: null, displayOrder: 5 },
    { branchId: baizakova.id, name: '6 месяцев', type: 'MONTHS_6', durationMonths: 6, price: 130000, timeRange: null, displayOrder: 6 },
    { branchId: baizakova.id, name: '12 месяцев', type: 'MONTHS_12', durationMonths: 12, price: 220000, timeRange: null, displayOrder: 7 },

    // Кожамкулова
    { branchId: kozhamkulova.id, name: '12 занятий (утро)', type: 'VISITS_12_MORNING', durationMonths: 1, price: 19000, timeRange: '07:00–17:00', displayOrder: 1 },
    { branchId: kozhamkulova.id, name: '12 занятий (полный день)', type: 'VISITS_12_FULL', durationMonths: 1, price: 22000, timeRange: '07:00–23:00', displayOrder: 2 },
    { branchId: kozhamkulova.id, name: 'Безлимит (утро)', type: 'UNLIMITED_MORNING', durationMonths: 1, price: 20000, timeRange: '07:00–17:00', displayOrder: 3 },
    { branchId: kozhamkulova.id, name: 'Безлимит (полный день)', type: 'UNLIMITED_FULL', durationMonths: 1, price: 24000, timeRange: '07:00–23:00', displayOrder: 4 },
    { branchId: kozhamkulova.id, name: '3 месяца', type: 'MONTHS_3', durationMonths: 3, price: 65000, timeRange: null, displayOrder: 5 },
    { branchId: kozhamkulova.id, name: '6 месяцев', type: 'MONTHS_6', durationMonths: 6, price: 120000, timeRange: null, displayOrder: 6 },
    { branchId: kozhamkulova.id, name: '12 месяцев', type: 'MONTHS_12', durationMonths: 12, price: 170000, timeRange: null, displayOrder: 7 },

    // Кабанбай батыра
    { branchId: kabanbay.id, name: '12 занятий (утро)', type: 'VISITS_12_MORNING', durationMonths: 1, price: 19000, timeRange: '07:00–17:00', displayOrder: 1 },
    { branchId: kabanbay.id, name: '12 занятий (полный день)', type: 'VISITS_12_FULL', durationMonths: 1, price: 22000, timeRange: '07:00–23:00', displayOrder: 2 },
    { branchId: kabanbay.id, name: 'Безлимит (утро)', type: 'UNLIMITED_MORNING', durationMonths: 1, price: 20000, timeRange: '07:00–17:00', displayOrder: 3 },
    { branchId: kabanbay.id, name: 'Безлимит (полный день)', type: 'UNLIMITED_FULL', durationMonths: 1, price: 24000, timeRange: '07:00–23:00', displayOrder: 4 },
    { branchId: kabanbay.id, name: '3 месяца', type: 'MONTHS_3', durationMonths: 3, price: 65000, timeRange: null, displayOrder: 5 },
    { branchId: kabanbay.id, name: '6 месяцев', type: 'MONTHS_6', durationMonths: 6, price: 120000, timeRange: null, displayOrder: 6 },
    { branchId: kabanbay.id, name: '12 месяцев', type: 'MONTHS_12', durationMonths: 12, price: 170000, timeRange: null, displayOrder: 7 },

    // Макатаева
    { branchId: makataeva.id, name: '12 занятий (утро)', type: 'VISITS_12_MORNING', durationMonths: 1, price: 19000, timeRange: '07:00–17:00', displayOrder: 1 },
    { branchId: makataeva.id, name: '12 занятий (полный день)', type: 'VISITS_12_FULL', durationMonths: 1, price: 21000, timeRange: '07:00–23:00', displayOrder: 2 },
    { branchId: makataeva.id, name: 'Безлимит (утро)', type: 'UNLIMITED_MORNING', durationMonths: 1, price: 20000, timeRange: '07:00–17:00', displayOrder: 3 },
    { branchId: makataeva.id, name: 'Безлимит (полный день)', type: 'UNLIMITED_FULL', durationMonths: 1, price: 23000, timeRange: '07:00–23:00', displayOrder: 4 },
    { branchId: makataeva.id, name: '3 месяца', type: 'MONTHS_3', durationMonths: 3, price: 50000, timeRange: null, displayOrder: 5 },
    { branchId: makataeva.id, name: '6 месяцев', type: 'MONTHS_6', durationMonths: 6, price: 90000, timeRange: null, displayOrder: 6 },
    { branchId: makataeva.id, name: '12 месяцев', type: 'MONTHS_12', durationMonths: 12, price: 130000, timeRange: null, displayOrder: 7 },
  ];

  // Delete existing memberships and recreate
  await prisma.membership.deleteMany();
  await prisma.membership.createMany({ data: membershipData });

  console.log(`Seeded: ${branches.length} branches, ${membershipData.length} memberships, 1 admin user`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
