const { validationResult } = require('express-validator');
const prisma = require('../../prisma/prismaClient')
// const storeRole = async (req,res) => {
//     try {
//         const errors =validationResult(req);

//         if(!errors.isEmpty()){
//             return res.status(200).json({
//                 success: false,
//                 msg: 'Errors',
//                 errors: errors.array()
//             });
//         }

//         const {role_name, value } = req.body;

//         const role = new Role({
//             role_name,
//             value
//         })

//         const roleData = await role.save()

//         return res.status(200).json({
//             success: true,
//             msg: 'Role Created Successfully!',
//             data: roleData,
//         });

//     } catch (error) {
//         return res.status(400).json({
//             success: false,
//             msg: error.message
//         })
        
//     }
// }

// const getRoles = async(req,res) => {
//     try {
//         const roles = await Role.find({
//             value: {
//                 $ne:1
//             }
//         })
        
//     } catch (error) {
//         return res.status(400).json({
//             success: false,
//             msg: error.message
//         })
        
//     }
// }

const storeRole = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Errors',
                errors: errors.array()
            });
        }

        const { role_name, value } = req.body;

        // Check if the role already exists (case insensitive)
        const existingRole = await prisma.role.findFirst({
            where: {
                roleName: {
                    equals: role_name,
                    mode: 'insensitive' // Case-insensitive check
                }
            }
        });

        if (existingRole) {
            return res.status(400).json({
                success: false,
                msg: 'Role name already exists'
            });
        }

        // Create and save new role
        const roleData = await prisma.role.create({
            data: {
                roleName: role_name, // Use the correct field name
                value
            }
        });

        return res.status(201).json({
            success: true,
            msg: 'Role Created Successfully!',
            data: roleData,
        });

    } catch (error) {
        console.error('Error occurred:', error);
        return res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};

const getRoles = async (req, res) => {
    try {
        const roles = await prisma.role.findMany({
            where: {
                value: {
                    not: 1 // Exclude roles with value 1
                }
            }
        });

        return res.status(200).json({
            success: true,
            msg: 'Roles fetched successfully!',
            data: roles,
        });
        
    } catch (error) {
        console.error('Error occurred:', error);
        return res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};

module.exports = {
    storeRole,
    getRoles,
}