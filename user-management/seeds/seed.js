const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/userModel'); 
const Permission = require('../models/permissionModel'); 
const Role = require('../models/roleModel');
const UserPermission = require('../models/userPermissionModel');

const rolesData = [
    { value: '1', role_name: 'Admin' },
    { value: '2', role_name: 'Regular user' },
    { value: '3', role_name: 'Sales' },
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
    {
        name: 'Doe',
        email: 'doe@example.com',
        role: '1', 
        password: '123456',
    },
    {
        name: 'Smith',
        email: 'smith@example.com',
        role: '3',
        password: '123456',
    },
];

const permissionsData = [
    {
        permission_name: 'view_reports',
        permission_value: [1], // Assuming 1 means allowed
    },
    {
        permission_name: 'edit_user',
        permission_value: [0], // Assuming 0 means not allowed
    },
];

const userPermissionsData = [
    {
        user_id: null, // Will be set later
        permissions: [
            { permission_name: 'view_reports', permission_value: [1] },
            { permission_name: 'edit_user', permission_value: [0] },
        ],
    },
    {
        user_id: null, // Will be set later
        permissions: [
            { permission_name: 'view_reports', permission_value: [1] },
            { permission_name: 'edit_user', permission_value: [1] },
        ],
    },
];

const seedDatabase = async () => {
    try {
        await mongoose.connect('mongodb://mongo:27017/users-role-perm', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Clear existing data
        await User.deleteMany({});
        await Permission.deleteMany({});
        await Role.deleteMany({});
        await UserPermission.deleteMany({});

        // Insert roles
        const createdRoles = await Role.insertMany(rolesData);

        // Map roles to user data and hash passwords
        const usersWithHashedPasswords = await Promise.all(usersData.map(async (user) => {
            const role = createdRoles.find(r => r.value === user.role);
            if (role) {
                user.role = role._id; // Set the user role to the role ID
            }

            const password = randomstring.generate(6);
            user.password = await bcrypt.hash(password, 10); // Hash the password

            console.log(`Generated Password for ${user.name}: ${password}`); // Log the plain password
            return user; // Return the updated user object
        }));

        // Insert users
        const createdUsers = await User.insertMany(usersWithHashedPasswords);

        // Insert permissions
        const createdPermissions = await Permission.insertMany(permissionsData);

        // Map user IDs to userPermissionsData
        userPermissionsData[0].user_id = createdUsers[0]._id; // John Doe's permissions
        userPermissionsData[1].user_id = createdUsers[1]._id; // Jane Smith's permissions

        // Insert user permissions
        await UserPermission.insertMany(userPermissionsData);

        console.log('Data seeded successfully!');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        mongoose.connection.close();
    }
};


seedDatabase();

module.exports = seedDatabase;