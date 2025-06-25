const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./model/user-model');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./swagger.json');
const path = require('path');
const { info } = require('console');
const swaggerJSDoc = require('swagger-jsdoc');
app.use(cors());
app.use(bodyParser.json());

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
        url: 'http://localhost:3000'
      }
    ]
  },
  apis: ['index.js'], // Path to the API docs
};

// Mount the router
app.use('/api', router);

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocs));

const swaggerDocs = swaggerJSDoc(swaggerOptions);

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
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               itemid:
 *                 type: number
 *                 description: Product ID
 *               item:
 *                 type: string
 *                 description: Product name
 *               quantity:
 *                 type: number
 *                 description: Quantity ordered
 *               subtotal:
 *                 type: number
 *                 description: Subtotal for this item
 *         totalAmount:
 *           type: number
 *           description: Total order amount
 *         status:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled]
 *           description: Order status
 *           default: pending
 *         shippingAddress:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             province:
 *               type: string
 *             postalCode:
 *               type: string
 *             country:
 *               type: string
 *         ispayed
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

app.listen(port,"0.0.0.0",  () => {
  console.log(`Example app listening on port ${port}`)
})