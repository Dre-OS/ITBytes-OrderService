const express = require('express');
const axios = require('axios');
const app = express();
const port = 3001;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Order = require('./model/order-model');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./swagger.json');
const path = require('path');
const { info } = require('console');
const swaggerJSDoc = require('swagger-jsdoc');
// const { connectRabbitMQ, publishToTopic, subscribeToTopic } = require('./modules/rabbitmq');
const {orderControllerOut, orderControllerIn} = require('./controller/order-controller');

app.use(cors());
app.use(express.json());




// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/itbytes-order', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
});

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'ITBytes Order Service API',
      version: '1.0.0',
      description: 'API for managing orders in ITBytes application',
    },
    servers: [
      {
        url: 'http://192.168.9.5:3001'
      }
    ]
  },
  apis: ['index.js'], // Path to the API docs
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

// Mount the router
app.use('/api/orders', router);

app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to ITBytes Order Service API', docs: '/api/api-docs' });
})

/** 
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - customerId
 *         - items
 *         - totalAmount
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         customerId:
 *           type: string
 *           description: ID of the customer who placed the order
 *         orders:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: Product ID
 *               name:
 *                 type: string
 *                 description: Product name
 *               quantity:
 *                 type: number
 *                 description: Quantity ordered
 *               price:
 *                 type: number
 *                 description: price of the item
 *               subtotal:
 *                 type: number
 *                 description: Subtotal for this item
 *         totalPrice:
 *           type: number
 *           description: Total order amount
 *         status:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled]
 *           description: Order status
 *           default: pending
 *         isPaid:
 *           type: boolean
 *           description: Indicates if the order is paid
 *           default: false
 *         editable:
 *           type: boolean
 *           description: Indicates if the order can be edited
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 * 
 */


/** * @swagger
 * /api/orders/out:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders from ITBytes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request
 */
router.post('/out', orderControllerOut.createOrder);

/**
 * @swagger
 * /api/orders/out:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders from ITBytes]
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get('/out', orderControllerOut.getAllOrders);


/**
 * @swagger
 * /api/orders/out/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders from ITBytes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.get('/out/:id', orderControllerOut.getOrderById);

/**
 * @swagger
 * /api/orders/out/customer/{customerId}:
 *   get:
 *     summary: Get orders by customer ID
 *     tags: [Orders from ITBytes]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Orders found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       404:
 *         description: No orders found for this customer
 *       500:
 *         description: Internal server error
 */
router.get('/out/customer/:customerId', orderControllerOut.getOrderByCustomerId);


/**
 * @swagger
 * /api/orders/out/{id}:
 *   put:
 *     summary: Update an existing order
 *     tags: [Orders from ITBytes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Order not found
 */
router.put('/out/:id', orderControllerOut.updateOrder);


/** * @swagger
 * /api/orders/out:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders from ITBytes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request
 */
router.post('/in', orderControllerIn.createOrder);



app.listen(port,"0.0.0.0",  () => {
  console.log(`Example app listening on port ${port}`)
  console.log(`API Documentation available at http://localhost:${port}/api/api-docs`);
})