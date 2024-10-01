require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('./logger');

// Connect to MongoDB
mongoose.connect("mongodb://mongo:27017/users-role-perm", {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
})
.then(() => {
    logger.info('Database connected successfully');
  })
  .catch(err => {
    logger.error(`Database connection failed: ${err.message}`);
  });
const express = require('express');
const app = express();
const router = express.Router();
app.use(express.static('public'));

app.use((req, res, next) => {
    logger.info(`Incoming request: ${req.method} ${req.url}`);
    next();
});
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

logger.info(`Server will run on port: ${port}`);

app.listen(port, () => {
    logger.info(`Server will run on port: ${port}`);
})

