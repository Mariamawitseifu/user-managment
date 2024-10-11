const mongoose = require('mongoose');
require('dotenv').config();
const Account = require('../models/accountModel'); 

const accountsData = [
    {
        name: 'John Doe',
        website: 'john@example.com',
        type: '1', 
        description: '123456',
        phone: '1234568',
        address: '123456',
        // parentAccount: '',
    },
    {
        name: 'John Doe',
        website: 'john@example.com',
        type: '1', 
        description: '123456',
        phone: '1234569',
        address: '1234565',
        // parentAccount: '',
    },
    {
        name: 'John Doe',
        website: 'john@example.com',
        type: '1', 
        description: '123456',
        phone: '1234561',
        address: '123456',
        // parentAccount: '',
    },
    {
        name: 'John Doe',
        website: 'john@example.com',
        type: '1', 
        description: '123456',
        phone: '1234562',
        address: '123456',
        // parentAccount: '',
    },
    {
        name: 'John Doe',
        website: 'john@example.com',
        type: '1', 
        description: '123456',
        phone: '1234563',
        address: '123456',
        // parentAccount: '',
    },
    {
        name: 'John Doe',
        website: 'john@example.com',
        type: '1', 
        description: '123456',
        phone: '12345624',
        address: '123456',
        // parentAccount: '',
    },
    {
        name: 'John Doe',
        website: 'john@example.com',
        type: '1', 
        description: '123456',
        phone: '12345625',
        address: '123456',
        // parentAccount: '',
    },
    {
        name: 'John Doe',
        website: 'john@example.com',
        type: '1', 
        description: '123456',
        phone: '12345626',
        address: '123456',
        // parentAccount: '',
    },
    {
        name: 'John Doe',
        website: 'john@example.com',
        type: '1', 
        description: '123456',
        phone: '12345627',
        address: '123456',
        // parentAccount: '',
    },
    {
        name: 'John Doe',
        website: 'john@example.com',
        type: '1', 
        description: '123456',
        phone: '123456211',
        address: '123456',
        // parentAccount: '',
    },
    {
        name: 'John Doe',
        website: 'john@example.com',
        type: '1', 
        description: '123456',
        phone: '123456212',
        address: '123456',
        // parentAccount: '',
    },
    {
        name: 'John Doe',
        website: 'john@example.com',
        type: '1', 
        description: '123456',
        phone: '123456213',
        address: '123456',
        // parentAccount: '',
    },
];



const seedDatabase = async () => {
    try {
        await mongoose.connect('mongodb://mongo:27017/users-role-perm', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Clear existing data
        await Account.deleteMany({});

        // Insert user permissions
        await Account.insertMany(accountsData);

        console.log('Data seeded successfully!');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        mongoose.connection.close();
    }
};


seedDatabase();

module.exports = seedDatabase;