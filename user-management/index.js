require('dotenv').config();
const express = require('express');
const logger = require('./logger');
const { mongoConnect } = require('./database/mongodb'); 

const app = express();
const router = express.Router();

// Connect to MongoDB
mongoConnect();

// Middleware
app.use(express.static('public'));
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`Incoming request: ${req.method} ${req.url}`);
    next();
});

// Routes
const authRoute = require('./routes/authRoute');
const commonRoute = require('./routes/commonRoute');

// Auth route
app.use('/api', authRoute);

// Admin route
app.use('/api/admin', require('./routes/adminRoute'));

// Common route
app.use('/api', commonRoute);

// Auth and Admin Middlewares
const auth = require('./middlewares/authMiddleware');
const { onlyAdminAccess } = require('./middlewares/adminMiddleware');
const routerController = require('./controllers/admin/routerController');
const { addRouterPermissionValidator } = require('./helpers/adminValidator');
const seedDatabase = require('./seeds/seed');

// Router for getting routes
router.get('/get-routes', auth, onlyAdminAccess, addRouterPermissionValidator, routerController.getAllRoutes);

// Server Port
const port = process.env.SERVER_PORT || 3000;

// Start the server
app.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}`);
});

logger.info(`Server will run on port: ${port}`);
