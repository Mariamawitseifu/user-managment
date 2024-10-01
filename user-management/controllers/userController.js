const { validationResult } = require('express-validator');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const {sendMail} = require('../helpers/mailer');
const mongoose = require('mongoose');
const Permission = require('../models/permissionModel');
const UserPermission = require('../models/userPermissionModel');

const createUser = async (req, res) => {
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

        const { name, email, role, permissions } = req.body;

        // Check if the email already exists
        const isExists = await User.findOne({ email });
        if (isExists) {
            return res.status(400).json({
                success: false,
                msg: 'Email already exists!'
            });
        }

        // Generate a random password and hash it
        const password = randomstring.generate(6);
        const hashPassword = await bcrypt.hash(password, 10);

        // Check if the role is 1 (admin), which cannot be created
        if (role && role == 1) {
            return res.status(403).json({
                success: false,
                msg: "You can't create admin!",
            });
        }

        // Create a new user object
        const user = new User({
            name,
            email,
            password: hashPassword,
            role
        });
       
        // Save the user to the database
        const userData = await user.save();
        
        // Initialize permissions array
        const permissionArray = [];

        if (permissions && permissions.length > 0) {
            try {
                // Fetch and add permissions
                await Promise.all(permissions.map(async (permission) => {
                    const permissionData = await Permission.findOne({ _id: permission.id });
                    if (permissionData) {
                        permissionArray.push({
                            permission_name: permissionData.permission_name,
                            permission_value: permission.value,
                        });
                    } else {
                        console.warn(`Permission with ID ${permission.id} not found`);
                    }
                }));

                if (permissionArray.length > 0) {
                    const userPermission = new UserPermission({
                        user_id: userData._id,
                        permissions: permissionArray
                    });

                    await userPermission.save();
                    console.log('User permissions assigned');
                }
            } catch (err) {
                console.error('Error handling permissions:', err);
            }
        }
        
        console.log('Generated Password:', password);
        
        // Prepare the email content
        const content = `
            <p>Hi <b>${userData.name}</b>,</p>
            <p>Your account has been created. Below are your details:</p>
            <table style="border-style:none;">
                <tr>
                    <th>Name:</th>
                    <td>${userData.name}</td>
                </tr>
                <tr>
                    <th>Email:</th>
                    <td>${userData.email}</td>
                </tr>
                <tr>
                    <th>Password:</th>
                    <td>${password}</td>
                </tr>
            </table>
            <p>You can now log into your account. Thanks!</p>
        `;

        // Send the email
        await sendMail(userData.email, 'Account Created', content);

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
        // Handle errors
        console.error('Error creating user:', error);
        return res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};

const getUser = async (req, res) => {
    try {
        // Extract the current user ID from the token
        const currentUserId = req.user._id;

        // Check if the currentUserId is valid
        if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid user ID',
                data: null
            });
        }

        // Perform aggregation to fetch users excluding the current user
        const users = await User.aggregate([
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
            }
        ]);

        // Debugging: Log the number of users fetched and currentUserId
        console.log(`Fetched ${users.length} users excluding ID ${currentUserId}`);

        return res.status(200).json({
            success: true,
            msg: 'Users fetched successfully!',
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            success: false,
            msg: 'Internal server error',
            data: null
        });
    }
};

const updateUser = async (req,res) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Errors',
                errors: errors.array()
            });
        }
        const { id, name } = req.body;

        const isExists = await User.findOne({
            _id: id
        })

        if(!isExists){
            return res.status(400).json({
                success: false,
                msg: 'User not exists!'
            })
        }
        var updateObj = {
            name
        }

        if(req.body.role != undefined){
            updateObj.role = req.body.role;
        }

        const updatedData = await User.findByIdAndUpdate({_id: id},{
            $set:updateObj
        }, { new: true });

        await UserPermission.findOneAndUpdate(
            {user_id: updatedData._id},
            {permissions: permissionArray},
            {upsert:true, new:true, setDefaultsOnInsert: true}
        );

        return res.status(200).json({
            success: true,
            msg: 'Users Updated successfully',
            data: updatedData
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        })
        
    }
}

const deleteUser = async (req,res) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            msg: 'Errors',
            errors: errors.array()
        });
    }

    const { id, name } = req.body;

    const isExists = await User.findOne({
        _id: id
    })

    if(!isExists){
        return res.status(400).json({
            success: false,
            msg: 'User not found!'
        })
    }
    await User.findByIdAndDelete({
        _id: id
    });

    return res.status(200).json({
        success: true,
        msg: 'Users Deleted successfully',
    });

}


module.exports = {
    createUser,
    getUser,
    updateUser,
    deleteUser,
};








