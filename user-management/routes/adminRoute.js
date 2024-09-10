const express = require('express');
const router = express.Router();

const permissionController = require('../controllers/admin/permissionController');

const auth = require('../middlewares/authMiddleware')
const { permissionAddValidator } = require('../helpers/adminValidator')


router.post('/add-permission', permissionAddValidator,permissionController.addPermission);


module.exports = router;
