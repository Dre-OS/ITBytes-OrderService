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

app.listen(port,"0.0.0.0",  () => {
  console.log(`Example app listening on port ${port}`)
})