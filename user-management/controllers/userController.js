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
const prismaQuery =require('../services/prismaQuery')

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

// const handlePermissions = async (permissions, userId) => {
//     const permissionArray = [];
//     if (permissions && permissions.length > 0) {
//         try {
//             const permissionDataArray = await prisma.permission.findMany({
//                 where: {
//                     id: {
//                         in: permissions.map(p => p.id),
//                     },
//                 },
//             });

//             // Log the fetched permissions for debugging
//             console.log('Fetched Permissions:', permissionDataArray);

//             permissionDataArray.forEach(permissionData => {
//                 const matchedPermission = permissions.find(p => p.id === permissionData.id);
//                 if (matchedPermission) {
//                     if (permissionData.permissionName) { // Ensure permissionName is defined
//                         permissionArray.push({
//                             permission_name: permissionData.permissionName, // Use correct field
//                             permission_value: matchedPermission.value,
//                         });
//                     } else {
//                         console.warn(`Permission data with ID ${permissionData.id} has no name`);
//                     }
//                 } else {
//                     console.warn(`No matching permission found for ID: ${permissionData.id}`);
//                 }
//             });

//             if (permissionArray.length > 0) {
//                 await prisma.userPermission.create({
//                     data: {
//                         userId: userId,
//                         permissions: {
//                             create: permissionArray.map(permission => ({
//                                 permissionName: permission.permission_name,
//                                 permissionValue: permission.permission_value,
//                             })),
//                         },
//                     },
//                 });
//                 logger.info('User permissions assigned');
//             } else {
//                 logger.warn('No valid permissions to assign');
//             }
//         } catch (err) {
//             logger.error('Error handling permissions:', err);
//         }
//     }
//     return permissionArray;
// };

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

const getUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Validate user ID
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({
                success: false,
                msg: 'Invalid user ID',
                data: null
            });
        }

        // Fetch user data along with permissions
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                userPermissions: {
                    include: {
                        permissions: true // Directly include permissions
                    }
                }
            }
        });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found',
                data: null
            });
        }

        // Flatten permissions for response
        const permissions = user.userPermissions.flatMap(up => 
            up.permissions.map(pd => ({
                permissionName: pd.permissionName,
                permissionValue: pd.permissionValue
            }))
        );

        // Respond with user data and permissions
        return res.status(200).json({
            success: true,
            msg: 'User fetched successfully!',
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions // Send the flattened permissions
            }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({
            success: false,
            msg: 'Internal server error',
            data: null
        });
    }
};

const getUsers = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const currentUserId = req.user._id;

    try {
        const startIndex = (page - 1) * limit;

        // Count total users excluding the current user
        const totalUsers = await prisma.user.count({
            where: {
                id: {
                    not: currentUserId, // Exclude current user
                },
            },
        });

        // Fetch users with pagination and permissions
        const users = await prisma.user.findMany({
            where: {
                id: {
                    not: currentUserId,
                },
            },
            skip: startIndex,
            take: limit,
            include: {
                userPermissions: {
                    include: {
                        permissions: true,
                    },
                },
            },
        });

        if (!users || users.length === 0) {
            return res.status(200).json({ success: true, msg: 'No users found', data: [] });
        }

        // Flatten permissions for response
        const usersWithPermissions = users.map(user => ({
            ...user,
            permissions: user.userPermissions.flatMap(up => up.permissions.map(p => ({
                permissionName: p.name,
                permissionValue: p.value,
            }))),
        }));

        // Calculate total pages
        const totalPages = Math.ceil(totalUsers / limit);

        res.status(200).json({
            success: true,
            msg: 'Users fetched successfully!',
            data: {
                users: usersWithPermissions,
                pagination: {
                    currentPage: page,
                    totalUsers,
                    totalPages,
                    limit,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, msg: 'Internal server error', error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const errors = validateRequest(req);
        if (errors) {
            return res.status(400).json(errors);
        }

        const { id } = req.params; // Extract id from params
        const { name, role, permissions } = req.body;

        const userExistsResponse = await checkUserExists(id);
        if (userExistsResponse) {
            return res.status(400).json(userExistsResponse);
        }

        // Update user data
        const updatedData = await updateUserData(id, { name, role });

        // Handle permissions
        if (permissions && Array.isArray(permissions)) {
            await handlePermissions(permissions, id);
        }

        // Fetch the user again to include permissions in the response
        const userWithPermissions = await prisma.user.findUnique({
            where: { id },
            include: {
                userPermissions: {
                    include: {
                        permissions: true,
                    },
                },
            },
        });

        // Flatten permissions for response
        const permissionsResponse = userWithPermissions.userPermissions.flatMap(up => 
            up.permissions.map(pd => ({
                permissionName: pd.permissionName,
                permissionValue: pd.permissionValue,
            }))
        );

        return res.status(200).json({
            success: true,
            msg: 'User updated successfully',
            data: {
                ...userWithPermissions,
                permissions: permissionsResponse, // Add permissions to response
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({
            success: false,
            msg: 'Internal server error',
            error: error.message
        });
    }
};

const handlePermissions = async (permissions, userId) => {
    const currentUserPermissions = await prisma.userPermission.findMany({
        where: { userId },
        include: { permissions: true },
    });

    const permissionsToCreate = [];
    const permissionsToUpdate = [];

    for (const permission of permissions) {
        const { id: permissionId, value: permissionValue } = permission;

        const existingPermission = currentUserPermissions.find(up =>
            up.permissions.some(pd => pd.id === permissionId)
        );

        if (!existingPermission) {
            // Create new permission entry if it doesn't exist
            permissionsToCreate.push({
                userId,
                permissions: {
                    create: [
                        {
                            permissionName: permissionId, // or whatever naming convention you use
                            permissionValue: [permissionValue], // ensure it's an array if needed
                        },
                    ],
                },
            });
        } else {
            // Update existing permission entry
            permissionsToUpdate.push({
                userPermissionId: existingPermission.id,
                permissionId,
                permissionValue,
            });
        }
    }

    // Create new UserPermission entries
    for (const permission of permissionsToCreate) {
        await prisma.userPermission.create({
            data: permission,
        });
    }

    // Update existing permissions
    for (const permission of permissionsToUpdate) {
        await prisma.permissionDetail.updateMany({
            where: {
                userPermissionId: permission.userPermissionId,
                permissionName: permission.permissionId,
            },
            data: {
                permissionValue: [permission.permissionValue], // Update as necessary
            },
        });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;

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
    const userExists = await prisma.user.findUnique({
        where: { id }
    });
    if (!userExists) {
        return {
            success: false,
            msg: 'User not found!'
        };
    }
    return null; // Return null if user exists
};


// const fetchUsers = async (currentUserId, page, limit) => {
//     const startIndex = (page - 1) * limit;
//     return await prisma.user.findMany.aggregate([
//         {
//             $match: { 
//                 _id: { $ne: new mongoose.Types.ObjectId(currentUserId) }
//             }
//         },
//         {
//             $lookup: {
//                 from: "userpermissions",
//                 localField: "_id",
//                 foreignField: "user_id",
//                 as: "permissions"
//             }
//         },
//         {
//             $project: {
//                 _id: 0,
//                 name: 1,
//                 email: 1,
//                 role: 1,
//                 permissions: {
//                     $cond: {
//                         if: { $isArray: "$permissions" },
//                         then: { $arrayElemAt: ["$permissions", 0] },
//                         else: null
//                     }
//                 }
//             }
//         },
//         {
//             $addFields: {
//                 permissions: {
//                     permissions: "$permissions.permissions"
//                 }
//             }
//         },
//         { $skip: startIndex },
//         { $limit: limit }
//     ]);
// };
const fetchUsers = async (currentUserId, page, limit) => {
    const startIndex = (page - 1) * limit;

    const users = await prisma.user.findMany({
        where: {
            id: {
                not: currentUserId,
            },
        },
        skip: startIndex,
        take: limit,
        include: {
            userPermissions: {
                include: {
                    permissions: true,
                },
            },
        },
    });

    // Flatten permissions
    return users.map(user => ({
        ...user,
        permissions: user.userPermissions.flatMap(up => up.permissions.map(p => ({
            permissionName: p.name,
            permissionValue: p.value,
        }))),
    }));
};



// const updateUserData = async (id, updateObj) => {
//     return await prisma.user.findUnique(
//         { _id: id },
//         { $set: updateObj },
//         { new: true }
//     );
// };


const updateUserData = async (id, updateObj) => {
    return await prisma.user.update({
        where: { id },
        data: updateObj, 
    });
};



module.exports = {
    createUser,
    getUsers,
    updateUser,
    deleteUser,
    getUser,
};