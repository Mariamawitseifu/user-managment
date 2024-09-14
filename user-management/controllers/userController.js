const { validationResult } = require('express-validator');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
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

        const { name, email, role } = req.body;

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
        
        //add permission to user if coming in request
        // if(req.body.permissions ! = undefined && req.body.permissions.length > 0){

        //     const addPermission = req.body.permissions;

        //     const permissionArray = [];
            
            
                
        //         await Promise.all(addPermission.map(async(permission)=>{
                
        //         const permissionData = await Permission.findOne({ _id: permission.id});

        //         permissionArray.push({
        //             permission_name: permissionData.permission_name,
        //             permission_value: permission.value,
        //         });
        //     }));

        //     const userPermission = new UserPermission({
        //         user_id: userData._id,
        //         permissions:permissionArray
        //     })

        //     await userPermission.save();
        //     console.log('wor')
        // }
        
        console.log(password);
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
            data: userData
        });
    } catch (error) {
        // Handle errors
        return res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};

const getUser = async (req,res) => {
    try {

    //     const result = await User.aggregate([
    //         {
    //             $match:{ 
    //                 _id:{
    //                     $ne: new mongoose.Types.ObjectId(req.user._id)
    //                 }
    //              }
    //         },
    //         {
    //             $lookup:{
    //                 from: "userpermissions",
    //                 localField: "_id",
    //                 foreignField: "user_id",
    //                 as: "permissions"
    //             }
    //         },
    //         {
    //             $project:{
    //                 _id:0,
    //                 name:1,
    //                 email:1,
    //                 role:1,
    //                 permissions:{
    //                     $cond:{
    //                         if: {$isArray: "$permissions"},
    //                         then: { $arrayElemAt: ["$permissions",0]},
    //                         else: null
    //                     }
    //                 }
    //             }
    //         },
    //         {
    //             $addFields:{
    //                 "permissions":{
    //                     "permissions": "$permissions.permissions"
    //                 }
    //             }
    //         }
    //    ]);

        const users = await User.find({
            _id: {
                $ne: req.user._id
            }
        });
        return res.status(201).json({
            success: true,
            msg: 'Users Fetched successfully!',
            data: users
        });
    } catch (error) {
        
    }

}

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

        return res.status(200).json({
            success: true,
            msg: 'Users Fetched successfully',
            data: users
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
