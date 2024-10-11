const { default: mongoose } = require('mongoose');
const User = require('../models/userModel');
const RouterPermission = require('../models/routerPermissionModel');

const getUserPermissions = async (user_id) => {
    try {
        const user = await User.aggregate([
            {
                $match: { 
                    _id: new mongoose.Types.ObjectId(user_id)
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
                    role: 1,
                    permissions: {
                        $cond:{
                            if: {$isArray: "$permissions"},
                            then:{$arrayElemAt: ["$permissions", 0]},
                            else:null
                        }
                    },
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
        
        return user[0];
        
    } catch (error) {
        return res.status(400).json({ 
            success: false,
            msg: error.message

        });
    }
    
}

// const getRouterPermission = async (req,res) => {
//     try {
//         const routerPermission = await RouterPermission.findOne({
//             router_endpoint: router,
//             role
//         }).populate('permission_id');

//         return routerPermission;
        
//     } catch (error) {
//         return res.status(400).json({ 
//             success: false,
//             msg: error.message

//         });
//     }
// }
const getRouterPermission = async (role, endpoint) => {
    try {
        const routerPermission = await RouterPermission.findOne({
            router_endpoint: endpoint, // Use endpoint passed from middleware
            role
        }).populate('permission_id');

        return routerPermission;
    } catch (error) {
        throw new Error(error.message);
    }
};



module.exports = {
    getUserPermissions,
    getRouterPermission,
}