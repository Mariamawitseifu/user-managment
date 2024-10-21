const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helper = require('../helpers/helper')
const prisma = require('../prisma/prismaClient');

const registerUser = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation errors',
                errors: errors.array()
            });
        }

        const { name, email, password, role } = req.body;

        // Check if user already exists
        const isExistUser = await prisma.user.findUnique({
            where: { email }
        });

        if (isExistUser) {
            return res.status(400).json({
                success: false,
                msg: 'Email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const userData = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role
            }
        });

        
        // Return the created user data including the ID
        return res.status(201).json({
            success: true,
            msg: 'Registered successfully',
            data: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role
            }
        });
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({
            success: false,
            msg: 'Internal server error',
            data: null
        });
    }
};

const loginUser = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation errors',
                errors: errors.array()
            });
        }

        // Get credentials from request
        const { email, password } = req.body;

        // Find the user by email
        const userData = await prisma.user.findUnique({
            where: { email }
        });

        // If user does not exist
        if (!userData) {
            return res.status(400).json({
                success: false,
                msg: 'Email and password are incorrect'
            });
        }

        // Compare passwords
        const isPasswordMatch = await bcrypt.compare(password, userData.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                msg: 'Email and password are incorrect'
            });
        }

        // Generate access token
        const accessToken = await generateAccessToken({ user: userData });

        // Fetch user permissions
        const permissions = await prisma.userPermission.findMany({
            where: {
                userId: userData.id, 
            },
            select: {
                permissions: true,
            }
        });

        // Send response
        return res.status(200).json({
            success: true,
            msg: 'Login successfully',
            accessToken,
            tokenType: 'Bearer',
            data: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                permissions: permissions.map(permission => permission.permissions)
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({
            success: false,
            msg: 'Internal server error'
        });
    }
};

const generateAccessToken = async(user) => {
    const token =jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {expiresIn:"2h"});
    return token;
}

const getProfile = async(req,res) => {
    try{

        const user_id = req.user._id;
        const userData = await User.findUnique({_id:user_id});

        return res.status(400).json({
            success: true,
            msg: 'Profile Data',
            data:userData
        });
    }
    catch(error){
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }
}

const getUserPermissions = async (req, res) => {
    try {
        const user_id = req.user.id; // Get the user ID from the request

        // Fetch user permissions
        const userPermissions = await prisma.userPermission.findMany({
            where: {
                userId: user_id, // Filter by the user's ID
            },
            include: {
                permissions: true, // Include related permissions
            },
        });

        if (!userPermissions.length) {
            return res.status(404).json({
                success: false,
                msg: 'No permissions found for this user',
            });
        }

        // Extract the permissions from the userPermissions
        const permissions = userPermissions.flatMap(userPerm => 
            userPerm.permissions.map(perm => ({
                permissionName: perm.permissionName,
                permissionValue: perm.permissionValue,
            }))
        );

        return res.status(200).json({
            success: true,
            msg: 'User Permissions',
            data: permissions,
        });
    } catch (error) {
        console.error('Error fetching user permissions:', error);
        return res.status(500).json({
            success: false,
            msg: error.message,
        });
    }
};


module.exports = {
    registerUser,
    loginUser,
    getProfile,
    getUserPermissions,
    loginUser,
    create: exports.create
};
