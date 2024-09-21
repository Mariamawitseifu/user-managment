const express = require('express');
const router = express();

const auth = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/checkPermission');

const { scheduleAddValidator,scheduleDeleteValidator,scheduleUpdateValidator, branchAddValidator} = require('../helpers/adminValidator');
const { createUserValidator, updateUserValidator, deleteUserValidator } = require('../helpers/validator')
const userController = require('../controllers/userController')


const scheduleController = require('../controllers/scheduleController');
const branchController = require('../controllers/branchController');

//branch
router.post('/add-branch', auth,branchAddValidator, branchController.addBranch)


//schedule
router.post('/add-schedule', auth, scheduleAddValidator, scheduleController.addSchedule)
router.get('/schedules', auth, scheduleController.getSchedule)
router.delete('/:id', auth, scheduleDeleteValidator, scheduleController.deleteSchedule)
router.put('/:id', auth, scheduleUpdateValidator, scheduleController.updateSchedule)


//users
router.post('/create-user', auth,createUserValidator, userController.createUser)
router.get('/get-users', auth, userController.getUser)
router.put('/update-user', auth, updateUserValidator, userController.updateUser)
router.delete('/delete-user', auth, deleteUserValidator, userController.deleteUser)


module.exports = router;