const express = require('express');
const router = express();

const permissionController = require('../controllers/admin/permissionController');

const roleController = require('../controllers/admin/roleController');
const routerController = require('../controllers/admin/routerController');

const {onlyAdminAccess} = require('../middlewares/adminMiddleware');
const auth = require('../middlewares/authMiddleware')
const { permissionAddValidator, permissionDeleteValidator, permissionUpdateValidator, storeRoleValidator, addRouterPermissionValidator,getRouterPermissionValidator } = require('../helpers/adminValidator');

//permission routes
router.post('/add-permission', auth, onlyAdminAccess,permissionAddValidator,permissionController.addPermission);
router.get('/get-permission', auth, onlyAdminAccess, permissionController.getPermissions);
router.delete('/delete-permission', auth, onlyAdminAccess, permissionDeleteValidator,permissionController.deletePermission);
router.put('/update-permission', auth, onlyAdminAccess, permissionUpdateValidator,permissionController.updatePermission);

// route
router.get('/get-routes',auth, onlyAdminAccess, routerController.getAllRoutes)

//role routes
router.post('/store-role', auth, onlyAdminAccess,storeRoleValidator, roleController.storeRole);
router.get('/get-roles', auth, onlyAdminAccess, roleController.getRoles);
router.get('/all-routes', auth, onlyAdminAccess, routerController.getAllRoutes);

//router permission
router.post('/add-router-permission', auth, onlyAdminAccess, addRouterPermissionValidator, routerController.addRouterPermission);
router.get('/get-router-permissions', auth, onlyAdminAccess, getRouterPermissionValidator, routerController.getRoutePermission);




module.exports = router;




