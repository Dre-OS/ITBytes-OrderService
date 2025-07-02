const Order = require("../model/order-model");
// const { Topic } = rabbitExpress;
// const rabbitExpress = require('rabbitmq-express');
const rabbitmq = require('rabbitmq-publisher');

const amqpuri =  process.env.AMQP_URI || 'amqp://guest:guest@localhost:5672';

// Create a server object to store the connection
const server = { 
  connection: null, 
  channel: null 
};

// Initialize connection
async function initRabbitMQ() {
  try {
    const connection = await rabbitmq.connect(amqpuri);
    server.connection = connection.connection;
    server.channel = connection.channel;
    console.log('Connected to RabbitMQ Publisher successfully');
  } catch (err) {
    console.error('Failed to connect to RabbitMQ:', err);
  }
}

// Initialize immediately
initRabbitMQ();

function createTopicPublisher(routingKey, exchange, queueName, options) {
  return rabbitmq.composePublisher({
    exchange: exchange,
    exchangeType: 'topic',
    connectionUri: amqpuri,
    routingKey: routingKey,
    queue: queueName,
    options: options
  }
  );
}



const publisher = {
  // paymentpending: createTopicPublisher('payment.pending', 'payment', 'payment-events', null),
  orderpaid: createTopicPublisher('order.paid', 'order', 'order-events', null),
  ordercreated: createTopicPublisher('order.created', 'order', 'order-events', null),
  ordercancelled: createTopicPublisher('order.cancelled', 'order', 'order-events', null),
}

const MessagingController = {
    paymentDone: async (req, res) => {
      try {
        const editedOrder = req.body;
        editedOrder.isPaid = true;
        const order = await Order.findByIdAndUpdate(req.body.id, editedOrder, { new: true, runValidators: true });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        // Publish the order paid event
        await publisher.orderpaid(server.channel, Buffer.from(JSON.stringify(order)));
        res.awknowledge = true; // Set acknowledgment flag to true
        // End the response cycle
        res.status(201).end();
        res.status(201);
        // res.status(201).json(res.body);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },
    orderCancelled: async (req, res) => {
      try {
        const response = await axios.get(req.body.url);
        res.status(201).json(response.data);
        // res.status(201).json(res.body);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },
}


// const server = rabbitExpress();

// const testTopic = new Topic('test');
// const outTopic = new Topic(':myparam');
// const noMiddlewareTopic = new Topic('no');

// testTopic.use((req, res) => {
//   console.log('hello test');
//   next();
// });
// outTopic.use((req, res) => {
//   console.log('hello out', req.params.myparam);
//   res.end();
// });

// outTopic.use(noMiddlewareTopic);
// testTopic.use(outTopic);

// server.use(testTopic);

// // defined topics here are ['test', 'test.:myparam']
// console.log(server.topics);
// // defined patterns here are ['test', 'test.*']
// console.log(server.patterns);

module.exports = {
  server,
  publisher,
  MessagingController,
}