const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const { sendMail } = require('../helpers/mailer');
const mongoose = require('mongoose');
const { redisClient, setCache, getCache } = require('../services/redisClient');
const {sendAccountCreationEmail} = require('../services/emailService')
const logger = require('../logger');
const Paginate = require('../services/paginate');
const prisma = require('../prisma/prismaClient');

const createUser = async (req, res) => {
    try {
        // Validate request
        const validationErrors = validateRequest(req);
        if (validationErrors) {
            return res.status(400).json(validationErrors);
        }

        const { name, email, role, permissions } = req.body;

        // Check for existing user
        const userExistsResponse = await checkExistingUser(email);
        if (userExistsResponse) {
            return res.status(400).json(userExistsResponse);
        }

        // Generate password and hash it
        const { password, hashPassword } = await generatePassword();

        // Check role restrictions
        const roleResponse = checkRole(role);
        if (roleResponse) {
            return res.status(403).json(roleResponse);
        }

        // Create and save user
        const userData = await saveUser(name, email, hashPassword, role);

        // Handle permissions
        const permissionArray = await handlePermissions(permissions, userData.id);

        // Send account creation email
        await sendAccountCreationEmail(userData, password);

        // Cache user data (if needed)
        await cacheUserData(userData);

        // Respond with success
        return res.status(201).json({
            success: true,
            msg: 'User created successfully!',
            data: {
                user: userData,
                permissions: permissionArray
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};

const saveUser = async (name, email, hashPassword, role) => {
    return await prisma.user.create({
        data: {
            name,
            email,
            password: hashPassword,
            role
        }
    });
};

const handlePermissions = async (permissions, userId) => {
    const permissionArray = [];
    if (permissions && permissions.length > 0) {
        try {
            const permissionDataArray = await prisma.permission.findMany({
                where: {
                    id: {
                        in: permissions.map(p => p.id)
                    }
                }
            });

            permissionDataArray.forEach(permissionData => {
                const matchedPermission = permissions.find(p => p.id === permissionData.id);
                if (matchedPermission) {
                    permissionArray.push({
                        permission_name: permissionData.name,
                        permission_value: matchedPermission.value,
                    });
                }
            });

            if (permissionArray.length > 0) {
                await prisma.userPermission.create({
                    data: {
                        userId: userId,
                        permissions: {
                            create: permissionArray
                        }
                    }
                });
                console.log('User permissions assigned');
            }
        } catch (err) {
            console.error('Error handling permissions:', err);
        }
    }
    return permissionArray;
};

const validateRequest = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return {
            success: false,
            msg: 'Validation errors',
            errors: errors.array()
        };
    }
    return null;
};

const checkExistingUser = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email }
    });
    
    if (user) {
        return {
            success: false,
            msg: 'Email already exists!',
            data: user
        };
    }
    return null;
};
const generatePassword = async () => {
    const password = randomstring.generate(6);
    const hashPassword = await bcrypt.hash(password, 10);
    return { password, hashPassword };
};

const checkRole = (role) => {
    if (role && role == 1) {
        return {
            success: false,
            msg: "You can't create admin!"
        };
    }
    return null;
};

const cacheUserData = async (userData) => {
    await setCache(`user:${userData.email}`, JSON.stringify(userData));
};

const validateUserId = (userId) => {
    // Example validation logic
    if (!userId || typeof userId !== 'string') {
        return { error: 'Invalid user ID' };
    }
    return null;
};

const getUsers = async (req, res) => {
    try {
        const limit = Paginate.getLimit(req);
        const offset = Paginate.getOffset(req);
        const currentUserId = req.user._id;

        const validationResponse = validateUserId(currentUserId);
        if (validationResponse) {
            return res.status(400).json(validationResponse);
        }

        // Fetch users with pagination using Prisma
        const users = await prisma.user.findMany({
            skip: offset,
            take: limit,
        });

        // Get total user count
        const count = await prisma.user.count();

        // Prepare paginated response
        const paginatedResponse = Paginate.getPaginated({ count, rows: users }, res);

        // Format the response to include IDs
        const formattedResponse = {
            success: true,
            totalCount: count,
            users: paginatedResponse.rows.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }))
        };

        return res.status(200).json(formattedResponse);
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            success: false,
            msg: 'Internal server error',
            data: null
        });
    }
};
const getUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id } 
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const errors = validateRequest(req);
        if (errors) {
            return res.status(400).json(errors);
        }

        const { id, name, role } = req.body;
        const userExistsResponse = await checkUserExists(id);
        if (userExistsResponse) {
            return res.status(400).json(userExistsResponse);
        }

        const updatedData = await updateUserData(id, { name, role });
        return res.status(200).json({
            success: true,
            msg: 'User updated successfully',
            data: updatedData
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params; // Get the user ID from the URL parameters

    try {
        const userExists = await prisma.user.findUnique({
            where: { id }
        });

        if (!userExists) {
            return res.status(404).json({ message: 'User not found' });
        }

        await prisma.user.delete({
            where: { id }
        });

        return res.status(200).json({
            success: true,
            msg: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({
            success: false,
            msg: 'Internal server error'
        });
    }
};


const checkUserExists = async (id) => {
    const isExists = await User.findOne({ _id: id });
    if (!isExists) {
        return {
            success: false,
            msg: 'User not found!'
        };
    }
    return null;
};

const fetchUsers = async (currentUserId, page, limit) => {
    const startIndex = (page - 1) * limit;
    return await User.aggregate([
        {
            $match: { 
                _id: { $ne: new mongoose.Types.ObjectId(currentUserId) }
            }
        },
        {
            $lookup: {
                from: "userpermissions",
                localField: "_id",
                foreignField: "user_id",
                as: "permissions"
            }
        },
        {
            $project: {
                _id: 0,
                name: 1,
                email: 1,
                role: 1,
                permissions: {
                    $cond: {
                        if: { $isArray: "$permissions" },
                        then: { $arrayElemAt: ["$permissions", 0] },
                        else: null
                    }
                }
            }
        },
        {
            $addFields: {
                permissions: {
                    permissions: "$permissions.permissions"
                }
            }
        },
        { $skip: startIndex },
        { $limit: limit }
    ]);
};

const updateUserData = async (id, updateObj) => {
    return await User.findByIdAndUpdate(
        { _id: id },
        { $set: updateObj },
        { new: true }
    );
};


module.exports = {
    createUser,
    getUsers,
    updateUser,
    deleteUser,
    getUser,
};