const express = require('express');
const router = express();

const auth = require('../middlewares/authMiddleware');
// const checkPermission = require('../middlewares/checkPermission');

const { scheduleAddValidator,scheduleDeleteValidator,scheduleUpdateValidator, branchAddValidator} = require('../helpers/adminValidator');
const { createUserValidator, updateUserValidator, deleteUserValidator, createAccountValidator,updateAccountValidator, createContactValidator,updateContactValidator } = require('../helpers/validator')
const userController = require('../controllers/userController')


const scheduleController = require('../controllers/scheduleController');
const branchController = require('../controllers/branchController');

const accountController = require('../controllers/accountController');
const contactController = require('../controllers/contactController');

//branch
router.post('/add-branch', auth, branchAddValidator, branchController.addBranch)


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


//account
router.post('/create-account', auth, createAccountValidator, accountController.registerAccount)
router.get('/get-account/:id', auth, accountController.getAccount)
router.get('/get-accounts', auth, accountController.getAccounts)
router.put('/update-account/:id', auth, updateAccountValidator, accountController.updateAccount)
router.delete('/delete-account/:id', auth, accountController.deleteAccount)


//contact

router.post('/create-contact', auth, createContactValidator, contactController.registerContact)
router.get('/get-contact/:id', auth, contactController.getContact)
router.get('/get-contacts', auth, contactController.getContacts)
router.patch('/update-contact/:id', auth, updateContactValidator, contactController.updateContact)
router.delete('/delete-contact/:id', auth, contactController.deleteContact)



module.exports = router;