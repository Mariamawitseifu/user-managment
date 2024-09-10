const { check, validationResult } = require('express-validator');

exports.permissionAddValidator = [
    check('permission_name', 'Permission Name is required').notEmpty(),
];

