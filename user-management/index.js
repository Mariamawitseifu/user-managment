require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/users-role-perm", {
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
const adminRoute = require('./routes/adminRoute')
app.use('/api/admin', adminRoute);

//common route
const commonRoute = require('./routes/commonRoute')
app.use('/api', commonRoute);

const auth = require('./middlewares/authMiddleware');
const { onlyAdminAccess } = require('./middlewares/adminMiddleware');
const routerController = require('./controllers/admin/routerController');
const { addRouterPermissionValidator } = require('./helpers/adminValidator');

router.get('/get-routes',auth, onlyAdminAccess,addRouterPermissionValidator, routerController.getAllRoutes)


const port = process.env.SERVER_PORT | 3000;

app.listen(port, () => {
    console.log("Server is running on Port:- "+port);
})
