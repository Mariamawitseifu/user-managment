require('dotenv').config();
const express = require('express');
const logger = require('./logger');
const { mongoConnect } = require('./database/mongodb'); 
const { redisClient, connectRedis } = require('./services/redisClient');

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

// Connect to Redis
connectRedis();

// Routes
const authRoute = require('./routes/authRoute');
const commonRoute = require('./routes/commonRoute');

// Auth route
app.use('/api', authRoute);

// Admin route
app.use('/api/admin', require('./routes/adminRoute'));

// Common route
app.use('/api', commonRoute);

app.get('/', (req, res) => res.send('Testing my Geolocation Node app!'));

// Redis example route
app.get('/api/cache/:key', async (req, res) => {
    const { key } = req.params;
    console.log(`Received request for key: ${key}`);

    try {
        const cachedData = await redisClient.get(key);
        console.log('Fetched from Redis:', cachedData);

        if (cachedData) {
            console.log('Cache hit');
            return res.json({ data: JSON.parse(cachedData) });
        } else {
            console.log('Cache miss');
            const data = { message: `Fetched data for ${key}` };
            await redisClient.setEx(key, 3600, JSON.stringify(data));
            console.log('Data cached in Redis');
            return res.json({ data });
        }
    } catch (err) {
        console.error('Redis error:', err);
        return res.status(500).send('Internal Server Error');
    }
});

app.post('/tag-location', (req, res) => {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'Latitude and Longitude are required' });
    }

    // Log the received location
    console.log(`Received location: Latitude: ${latitude}, Longitude: ${longitude}`);

    // Respond with a success message
    res.json({
        message: 'Location received successfully',
        location: {
            latitude,
            longitude,
        },
    });
});

// Auth and Admin Middlewares
const auth = require('./middlewares/authMiddleware');
const { onlyAdminAccess } = require('./middlewares/adminMiddleware');
const routerController = require('./controllers/admin/routerController');
const { addRouterPermissionValidator } = require('./helpers/adminValidator');

// Router for getting routes
router.get('/get-routes', auth, onlyAdminAccess, addRouterPermissionValidator, routerController.getAllRoutes);

// Server Port
const port = process.env.SERVER_PORT || 3000;

// Start the server
app.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}`);
});
