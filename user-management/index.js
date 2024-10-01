require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('./logger');

// Connect to MongoDB
mongoose.connect("mongodb://mongo:27017/users-role-perm", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

const express = require('express');
const app = express();
const router = express.Router();
app.use(express.static('public'));

//auth route
const authRoute = require('./routes/authRoute')
app.use(express.json()); 
app.use('/api', authRoute);

//admin route
app.use('/api/admin', require('./routes/adminRoute'));

//common route
const commonRoute = require('./routes/commonRoute')
app.use('/api', commonRoute);

const auth = require('./middlewares/authMiddleware');
const { onlyAdminAccess } = require('./middlewares/adminMiddleware');
const routerController = require('./controllers/admin/routerController');
const { addRouterPermissionValidator } = require('./helpers/adminValidator');

router.get('/get-routes',auth, onlyAdminAccess,addRouterPermissionValidator, routerController.getAllRoutes)


logger.info('Application has started');
logger.error('An error occurred', { error: new Error('Sample error') });

const port = process.env.SERVER_PORT | 3000;

console.log({port})

app.listen(port, () => {
    console.log("Server is running on Port:- "+port);
})

