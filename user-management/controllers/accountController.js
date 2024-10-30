const Account = require('../models/accountModel');
const { validationResult } = require('express-validator');
const prisma = require('../prisma/prismaClient');

const registerAccount = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation errors',
                errors: errors.array()
            });
        }

        const { name, website, type, description, phone, address, parentAccount } = req.body;

        // Normalize phone input to an array
        let phoneNumbers = Array.isArray(phone) ? phone : [phone];

        // Check if the phoneNumbers array has at least one number
        if (phoneNumbers.length === 0 || !phoneNumbers.every(p => typeof p === 'string')) {
            return res.status(400).json({
                success: false,
                msg: 'Phone must be a non-empty array or a single phone number as a string.'
            });
        }

        // Check for duplicates in the phone numbers array
        const existingAccounts = await prisma.account.findMany({
            where: {
                phone: {
                    hasSome: phoneNumbers,
                },
            },
        });

        if (existingAccounts.length > 0) {
            return res.status(400).json({
                success: false,
                msg: 'One or more phone numbers already exist',
                existingPhones: existingAccounts.flatMap(account => account.phone), // Flatten the phone numbers
            });
        }

        // Save the new account
        const accountData = await prisma.account.create({
            data: {
                name,
                website,
                type,
                description,
                phone: phoneNumbers, // Store the array of phone numbers
                address,
                // parentAccountId: parentAccount, // Uncomment if you have a parent account
            }
        });

        return res.status(201).json({
            success: true,
            msg: 'Account Registered successfully',
            data: accountData
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};

const getAccounts = async (req, res) => {
    try {
        // Get page and limit from query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Calculate the starting index for pagination
        const startIndex = (page - 1) * limit;

        // Fetch the accounts with pagination
        const accounts = await prisma.account.findMany({
            skip: startIndex,
            take: limit,
        });

        const totalAccounts = await prisma.account.count();

        res.status(200).json({
            totalAccounts,
            totalPages: Math.ceil(totalAccounts / limit),
            currentPage: page,
            accounts,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};


const getAccount = async (req,res) => {
    const { id } =req.params;
    try {
        const account = await prisma.account.findUnique({
            where:{id}
        });

        if (!account){
            return res.status(404).json({message: 'Account not found'});
        }
        res.status(200).json(account);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateAccount = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Errors',
                errors: errors.array()
            });
        }

        // Use the correct syntax for the update method
        const updatedAccount = await prisma.account.update({
            where: { id: Number(id) },  // Ensure id is a number if needed
            data: updates,
        });

        res.status(200).json(updatedAccount);
    } catch (error) {
        if (error.code === 'P2025') { // Record not found
            return res.status(404).json({ message: 'Account not found' });
        }
        res.status(400).json({ error: error.message });
    }
};


const deleteAccount = async (req,res) => {

    const {id} = req.params;

    try {
        // const accountExists = await prisma.account.findUnique({
        //     where: {id}
        // });
        const deletedAccount = await prisma.account.findUnique({
            where: {id}
        });
        await prisma.account.delete({ where: {id}});
        if (!deletedAccount) {
            return res.status(404).json({ message: 'Account not found' });
        }
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};


module.exports = {
    registerAccount,
    getAccounts,
    getAccount,
    updateAccount,
    deleteAccount,
}



