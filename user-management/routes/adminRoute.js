const express = require('express');
const router = express.Router();

const permissionController = require('../controllers/admin/permissionController');

const auth = require('../middlewares/authMiddleware')
const { permissionAddValidator, permissionDeleteValidator, permissionUpdateValidator } = require('../helpers/adminValidator')


router.post('/add-permission', permissionAddValidator,permissionController.addPermission);
router.get('/get-permission', permissionController.getPermissions);
router.get('/delete-permission', permissionDeleteValidator,permissionController.deletePermission);
router.get('/update-permission', permissionUpdateValidator,permissionController.updatePermission);


module.exports = router;
