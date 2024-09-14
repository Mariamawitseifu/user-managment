const User = require('../models/userModel');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Permission = require('../models/permissionModel');
const UserPermission = require('../models/userPermissionModel');

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

        const isExistUser = await User.findOne({ email });

        if (isExistUser) {
            return res.status(400).json({
                success: false,
                msg: 'Email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        const userData = await user.save();

        Permission.find({
            is_default:1
        });

        const defaultPermissions = await Permission.find({
            is_default: 1
        });

        if(defaultPermissions.length > 0){
            const permissionArray = [];
            defaultPermissions.forEach(permission => {
                permissionArray.push({
                    permission_name:permission.permission_name,
                    permission_value:[0,1,2,3]

                });
            })

            const userPermission = new UserPermission({
                user_id:userData._id,
                permissions:permissionArray
            });

            await userPermission.save();
        }
       
        return res.status(201).json({
            success: true,
            msg: 'Registered successfully',
            data: userData
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};


const loginUser = async(req,res) => {
    try {
        //check if user exists
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation errors',
                errors: errors.array()
            });
        }
        // get credential
        const {email,password} = req.body;

        // validate email and password credentials

        const userData = await User.findOne({ email });

        if(!userData){
            return res.status(400).json({
                success:false,
                msg: "Email and Password is incorrect"
            })
        }

       const isPasswordMatch = await bcrypt.compare(password, userData.password);
       
       if(!isPasswordMatch){
        return res.status(400).json({
            success: false,
            msg: 'Email and password is incorrect'
        });
       }

       const accessToken = await generateAccessToken({user:userData});

       //get user data with all permissions

       const result = await User.aggregate([
            {
                $match:{ email:userData.email }
            },
            {
                $lookup:{
                    from: "userpermissions",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "permissions"
                }
            },
            {
                $project:{
                    _id:0,
                    name:1,
                    email:1,
                    role:1,
                    permissions:{
                        $cond:{
                            if: {$isArray: "$permissions"},
                            then: { $arrayElemAt: ["$permissions",0]},
                            else: null
                        }
                    }
                }
            },
            {
                $addFields:{
                    "permissions":{
                        "permissions": "$permissions.permissions"
                    }
                }
            }
       ]);

    // const result = await User.aggregate([
    //     {
    //         $match: { _id: userData._id }
    //     },
    //     {
    //         $lookup: {
    //             from: "userpermissions",
    //             localField: "_id",
    //             foreignField: "user_id",
    //             as: "permissions"
    //         }
    //     },
    //     {
    //         $unwind: {
    //             path: "$permissions",
    //             preserveNullAndEmptyArrays: true 
    //         }
    //     },
    //     {
    //         $project: {
    //             _id: 1,
    //             name: 1,
    //             email: 1,
    //             role: 1,
    //             permissions: "$permissions.permissions"
    //         }
    //     }
    // ]);


       return res.status(200).json({
        success:true,
        msg: 'Login Successfully',
        accessToken: accessToken,
        tokenType:'Bearer',
        data:userData
       });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            msg: error.message
        });
    }

}

const generateAccessToken = async(user) => {
    const token =jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {expiresIn:"2h"});
    return token;
}

const getProfile = async(req,res) => {
    try{

        const user_id = req.user._id;
        const userData = await User.findOne({_id:user_id});

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

module.exports = {
    registerUser,
    loginUser,
    getProfile,
};
