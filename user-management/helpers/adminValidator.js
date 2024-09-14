const { check, validationResult } = require('express-validator');

exports.permissionAddValidator = [
    check('permission_name', 'Permission Name is required').not().isEmpty(),
];

exports.permissionDeleteValidator = [
    check('id', 'ID is required').not().isEmpty(),
];
exports.permissionUpdateValidator = [
    check('id', 'ID is required').not().isEmpty(),
    check('permission_name', 'Permission Name is required').not().isEmpty(),
];

exports.storeRoleValidator = [
    check('role_name', 'Permission Name is required').not().isEmpty(),
    check('value', 'value is required').not().isEmpty(),
];


exports.scheduleAddValidator = [
    check('user_id', 'user is required').not().isEmpty(),
    check('branch_id', 'branch is required').not().isEmpty(),
]

exports.scheduleDeleteValidator = [
    check('id', 'id is required').not().isEmpty(),
]
exports.scheduleUpdateValidator = [
    check('id', 'id is required').not().isEmpty(),
]

exports.branchAddValidator = [
    check('name', 'name is required').not().isEmpty(),
]

