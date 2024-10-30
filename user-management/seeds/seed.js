const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rolesData = [
  { role_name: 'Admin', value: '1' },
  { role_name: 'Regular user', value: '2' },
  { role_name: 'Sales', value: '3' },
];

const usersData = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    role: '1',
    password: '123456',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: '3',
    password: '123456',
  },
];

const permissionsData = [
  {
    permission_name: 'view_reports',
    permission_value: 1,
  },
  {
    permission_name: 'edit_user',
    permission_value: 0,
  },
];

const userPermissionsData = [
  {
    userId: null, // Will be set later
    permissions: [
      { permission_name: 'view_reports', permission_value: 1 },
      { permission_name: 'edit_user', permission_value: 0 },
    ],
  },
  {
    userId: null, // Will be set later
    permissions: [
      { permission_name: 'view_reports', permission_value: 1 },
      { permission_name: 'edit_user', permission_value: 1 },
    ],
  },
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.permission.deleteMany({});
    await prisma.userPermission.deleteMany({});

    // Insert roles
    const createdRoles = await prisma.role.createMany({ data: rolesData });

    // Insert permissions
    const createdPermissions = await prisma.permission.createMany({ data: permissionsData });

    // Insert users and map roles
    for (const user of usersData) {
      const role = await prisma.role.findUnique({ where: { value: user.role } });
      const hashedPassword = await bcrypt.hash(user.password, 10); // Hash the password
      await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: hashedPassword,
          roleId: role.id, // Set the user role to the role ID
        },
      });
    }

    console.log('Data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seedDatabase();

module.exports = seedDatabase;