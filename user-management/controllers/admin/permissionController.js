const { validationResult } = require('express-validator');
const prisma = require('../../prisma/prismaClient');

// const addPermission = async (req, res) => {
//     try {
//         console.log('Request body:', req.body);

//         // Validate request
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             console.log('Validation errors:', errors.array());
//             return res.status(200).json({
//                 success: false,
//                 msg: 'Errors',
//                 errors: errors.array()
//             });
//         }

//         // Extract permission name from request body
//         const { permission_name } = req.body;

//         // Check if the permission already exists
//         const isExists = await Permission.findOne({
//             permission_name: {
//                 $regex: permission_name,
//                 $options: 'i'
//             }
//         });
//         console.log('Permission exists:', isExists);

//         if (isExists) {
//             return res.status(400).json({
//                 success: false,
//                 msg: 'Permission name already exists'
//             });
//         }

//         var obj = {
//             permission_name
//         }

//         if (req.body.default) {
//             obj.is_default = parseInt(req.body.default);
//         }
//         // Create and save new permission
//         const permission = new Permission(obj);
//         const savedPermission = await permission.save();
//         console.log('Saved permission:', savedPermission);

//         // Respond with success
//         return res.status(201).json({
//             success: true,
//             msg: 'Permission added successfully'
//         });

//     } catch (error) {
//         console.error('Error occurred:', error);
//         // Handle unexpected errors
//         return res.status(500).json({
//             success: false,
//             msg: error.message
//         });
//     }
// };
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


// const getPermissions =async(req,res) => {
//     try{
//         const permissions = await Permission.find({});
 
//         return res.status(200).json({
//             success: true,
//             msg: 'Permissions Fetched Successfully!',
//             data: permissions
//         });

//     }
//     catch(error){
//         return res.status(400).json({
//             success: false,
//             msg: error.message
//         })
//     }
// }

const getPermissions = async (req, res) => {
    try {
        const { limit, page } = req.query; // Retrieve query parameters for pagination

        const take = limit ? parseInt(limit) : undefined;
        const skip = page && limit ? (parseInt(page) - 1) * parseInt(limit) : undefined;

        const permissions = await prisma.permission.findMany({
            take,
            skip,
        });

        const totalCount = await prisma.permission.count(); // Get total count for pagination

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

// const deletePermission = async (req,res) => {
//     try{
//         const errors = validationResult(req);

//         if(!errors.isEmpty()){
//             return res.status(200).json({
//                 success: false,
//                 msg: 'Errors',
//                 errors: errors.array()
//             });
//         }

//         const { id } = req.body;

//         await Permission.findByIdAndDelete({_id: id});

//         return res.status(200).json({
//             success: false,
//             msg: 'Permission Deleted Successully!',
//         });

//     }
//     catch(error){
//         return res.status(400).json({

//         })

//     }
// }

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

        const { id } = req.params; // Get the ID from the URL parameters

        // Delete the permission
        const deletedPermission = await prisma.permission.delete({
            where: {
                id, // Assuming the ID is a string (UUID)
            },
        });

        return res.status(200).json({
            success: true,
            msg: 'Permission Deleted Successfully!',
            data: deletedPermission, // Optionally return the deleted permission data
        });

    } catch (error) {
        console.error('Error occurred:', error);
        return res.status(500).json({
            success: false,
            msg: error.message,
        });
    }
};

// const updatePermission = async (req, res) => {
//     try {
//         const errors = validationResult(req);

//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 success: false,
//                 msg: 'Validation errors',
//                 errors: errors.array()
//             });
//         }

//         const { id, permission_name } = req.body;

//         // Check if the permission ID exists
//         const isExists = await Permission.findOne({ _id: id });

//         if (!isExists) {
//             return res.status(404).json({
//                 success: false,
//                 msg: 'Permission ID does not exist!'
//             });
//         }

//         // Check if the permission name is already assigned to a different ID
//         const isNameAssigned = await Permission.findOne({
//             _id: { $ne: id },
//             permission_name
//         });

//         if (isNameAssigned) {
//             return res.status(400).json({
//                 success: false,
//                 msg: 'Permission name is already assigned to another permission!'
//             });
//         }

//         // Prepare the update object
//         const updateFields = { permission_name };

//         if (req.body.default != null) { //1 ya 0, true false
//             updateFields.is_default = parseInt(req.body.default);
//         }

//         // Perform the update
//         const updatedPermission = await Permission.findByIdAndUpdate(id, {
//             $set: updateFields
//         }, { new: true });

//         return res.status(200).json({
//             success: true,
//             msg: 'Permission updated successfully',
//             data: updatedPermission
//         });

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             msg: 'Permission ID is not found!'
//         });
//     }
// }

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

        const { id } = req.params; // Get the ID from the URL parameters
        const { permission_name } = req.body;

        // Check if the permission ID exists
        const isExists = await prisma.permission.findUnique({
            where: {
                id, // Assuming the ID is a string (UUID)
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
                    not: id, // Exclude the current ID
                },
                permissionName: permission_name, // Use the correct field name
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
            permissionName: permission_name, // Use the correct field name
            ...(req.body.default != null ? { isDefault: parseInt(req.body.default) } : {}),
        };

        // Perform the update
        const updatedPermission = await prisma.permission.update({
            where: {
                id, // Assuming the ID is a string (UUID)
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
