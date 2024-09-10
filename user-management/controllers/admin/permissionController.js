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
        const isExists = await Permission.findOne({ permission_name });
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
        const newPermission = await newPermission.save();

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

module.exports = {
    addPermission
};
