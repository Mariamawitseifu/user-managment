const Account = require('../models/accountModel');
const { validationResult } = require('express-validator');

const registerAccount = async (req,res) => {
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

        let phoneNumbers = Array.isArray(phone) ? phone : [phone];

        // Check if the phoneNumbers array has at least one number
        if (phoneNumbers.length === 0 || !phoneNumbers.every(p => typeof p === 'string')) {
            return res.status(400).json({
                success: false,
                msg: 'Phone must be a non-empty array or a single phone number as a string.'
            });
        }

        // Check for duplicates in the array
        const existingAccounts = await Account.find({ phone: { $in: phoneNumbers } });

        if (existingAccounts.length > 0) {
            return res.status(400).json({
                success: false,
                msg: 'One or more phone numbers already exist',
                existingPhones: existingAccounts.map(account => account.phone).flat()
            });
        }


        const account = new Account({
            name,
            website,
            type,
            description,
            phone:phoneNumbers,
            address,
            parentAccount,
        });
        
        const accountData = await account.save();

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

        // Calculate the starting index for the query
        const startIndex = (page - 1) * limit;

        // Fetch the accounts with pagination
        const accounts = await Account.find()
            .limit(limit)
            .skip(startIndex);

        const totalAccounts = await Account.countDocuments();

        res.status(200).json({
            totalAccounts,
            totalPages: Math.ceil(totalAccounts / limit),
            currentPage: page,
            accounts
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAccount = async (req,res) => {
    const { id } =req.params;
    try {
        const account = await Account.findById(id);

        if (!account){
            return res.status(404).json({message: 'Account not found'});
        }
        res.status(200).json(account);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateAccount = async (req,res) => {
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
        
        const updatedAccount = await Account.findByIdAndUpdate(id, updates, {new:true});

        if (!updatedAccount) {
            return res.status(404).json({ message: 'Account not found' });
        }
        res.status(200).json(updatedAccount);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteAccount = async (req,res) => {

    const {id} = req.params;

    try {
        const deletedAccount = await Account.findByIdAndDelete(id);
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