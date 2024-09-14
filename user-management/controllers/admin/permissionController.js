const { validationResult } = require('express-validator');
const Permission = require('../../models/permissionModel');

const addPermission = async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation errors',
                errors: errors.array()
            });
        }

        // Extract permission name from request body
        const { permission_name } = req.body;

        // Check if the permission already exists
        const isExists = await Permission.findOne({
            permission_name:{
                $regex: permission_name,
                $options: 'i'
            } });
        if (isExists) {
            return res.status(400).json({
                success: false,
                msg: 'Permission name already exists'
            });
        }

        var obj = {
            permission_name
        }

        if(req.body.default){
            obj.is_default = parseInt(req.body.default);
        }
        // Create and save new permission
        const permission = new Permission(obj);
        const savedPermission = await permission.save();

        // Respond with success
        return res.status(201).json({
            success: true,
            msg: 'Permission added successfully'
        });

    } catch (error) {
        // Handle unexpected errors
        return res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};


const getPermissions =async(req,res) => {
    try{
        const permissions = await Permission.find({});
 
        return res.status(200).json({
            success: true,
            msg: 'Permissions Fetched Successfully!',
            data: permissions
        });

    }
    catch(error){
        return res.status(400).json({
            success: false,
            msg: error.message
        })
    }
}

const deletePermission = async (req,res) => {
    try{
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(200).json({
                success: false,
                msg: 'Errors',
                errors: errors.array()
            });
        }

        const { id } = req.body;

        await Permission.findByIdAndDelete({_id: id});

        return res.status(200).json({
            success: false,
            msg: 'Permission Deleted Successully!',
        });

    }
    catch(error){
        return res.status(400).json({

        })

    }
}

const updatePermission = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation errors',
                errors: errors.array()
            });
        }

        const { id, permission_name } = req.body;

        // Check if the permission ID exists
        const isExists = await Permission.findOne({ _id: id });

        if (!isExists) {
            return res.status(404).json({
                success: false,
                msg: 'Permission ID does not exist!'
            });
        }

        // Check if the permission name is already assigned to a different ID
        const isNameAssigned = await Permission.findOne({
            _id: { $ne: id },
            permission_name
        });

        if (isNameAssigned) {
            return res.status(400).json({
                success: false,
                msg: 'Permission name is already assigned to another permission!'
            });
        }

        // Prepare the update object
        const updateFields = { permission_name };

        if (req.body.default != null) { //1 ya 0, true false
            updateFields.is_default = parseInt(req.body.default);
        }

        // Perform the update
        const updatedPermission = await Permission.findByIdAndUpdate(id, {
            $set: updateFields
        }, { new: true });

        return res.status(200).json({
            success: true,
            msg: 'Permission updated successfully',
            data: updatedPermission
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Permission ID is not found!'
        });
    }
}



module.exports = {
    addPermission,
    getPermissions,
    deletePermission,
    updatePermission,
};
