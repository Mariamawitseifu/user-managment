const { check, validationResult } = require('express-validator');

exports.registerValidator = [
    check('name', 'Name is required').notEmpty(),
    check('email', 'Please include a valid email address').isEmail().normalizeEmail({
        gmail_remove_dots: true
    }),
    check('password', 'Password is required').notEmpty().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation errors',
                errors: errors.array()
            });
        }
        next();
    }
];


exports.loginValidator = [
    check('email', 'Please include a valid email address').isEmail().normalizeEmail({
        gmail_remove_dots: true
    }),
    check('password', 'Password is required').notEmpty().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

exports.createUserValidator = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email address').isEmail().normalizeEmail({
        gmail_remove_dots: true
    }),
];

exports.updateUserValidator = [
    check('id', 'id is required').not().isEmpty(),
    check('name', 'name is required').not().isEmpty(),
];

exports.deleteUserValidator = [
    check('id', 'id is required').not().isEmpty(),
];

