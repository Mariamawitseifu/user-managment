const { validationResult } = require('express-validator');
const prisma = require('../../prisma/prismaClient');

const addPermission = async (req, res) => {
    try {
        console.log('Request body:', req.body);

        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Errors',
                errors: errors.array()
            });
        }

        // Extract permission name from request body
        const { permission_name } = req.body;

        // Check if the permission already exists (case insensitive)
        const isExists = await prisma.permission.findFirst({
            where: {
                permissionName: {
                    equals: permission_name,
                    mode: 'insensitive'
                }
            }
        });

        if (isExists) {
            return res.status(400).json({
                success: false,
                msg: 'Permission name already exists'
            });
        }

        // Create and save new permission
        const obj = {
            permissionName: permission_name, // Use the correct field name
            ...(req.body.default != null ? { isDefault: parseInt(req.body.default) } : {})
        };

        const savedPermission = await prisma.permission.create({
            data: obj
        });

        return res.status(201).json({
            success: true,
            msg: 'Permission added successfully',
            data: savedPermission // Optionally return the saved permission data
        });

    } catch (error) {
        console.error('Error occurred:', error);
        return res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};


const getPermissions = async (req, res) => {
    try {
        const { limit, page } = req.query; 

        const take = limit ? parseInt(limit) : undefined;
        const skip = page && limit ? (parseInt(page) - 1) * parseInt(limit) : undefined;

        const permissions = await prisma.permission.findMany({
            take,
            skip,
        });

        const totalCount = await prisma.permission.count();

        return res.status(200).json({
            success: true,
            msg: 'Permissions Fetched Successfully!',
            data: permissions,
            total: totalCount,
            currentPage: page ? parseInt(page) : 1,
            totalPages: limit ? Math.ceil(totalCount / limit) : 1,
        });

    } catch (error) {
        console.error('Error fetching permissions:', error);
        return res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};

const deletePermission = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation errors',
                errors: errors.array(),
            });
        }

        const { id } = req.params; 

        const deletedPermission = await prisma.permission.delete({
            where: {
                id, 
            },
        });

        return res.status(200).json({
            success: true,
            msg: 'Permission Deleted Successfully!',
            data: deletedPermission, 
        });

    } catch (error) {
        console.error('Error occurred:', error);
        return res.status(500).json({
            success: false,
            msg: error.message,
        });
    }
};

const updatePermission = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation errors',
                errors: errors.array(),
            });
        }

        const { id } = req.params;
        const { permission_name } = req.body;

        const isExists = await prisma.permission.findUnique({
            where: {
                id,
            },
        });

        if (!isExists) {
            return res.status(404).json({
                success: false,
                msg: 'Permission ID does not exist!',
            });
        }

        // Check if the permission name is already assigned to a different ID
        const isNameAssigned = await prisma.permission.findFirst({
            where: {
                id: {
                    not: id, 
                },
                permissionName: permission_name,
            },
        });

        if (isNameAssigned) {
            return res.status(400).json({
                success: false,
                msg: 'Permission name is already assigned to another permission!',
            });
        }

        // Prepare the update object
        const updateFields = {
            permissionName: permission_name,
            ...(req.body.default != null ? { isDefault: parseInt(req.body.default) } : {}),
        };

        // Perform the update
        const updatedPermission = await prisma.permission.update({
            where: {
                id,
            },
            data: updateFields,
        });

        return res.status(200).json({
            success: true,
            msg: 'Permission updated successfully',
            data: updatedPermission,
        });

    } catch (error) {
        console.error('Error occurred:', error);
        return res.status(500).json({
            success: false,
            msg: error.message,
        });
    }
};



module.exports = {
    addPermission,
    getPermissions,
    deletePermission,
    updatePermission,
};
