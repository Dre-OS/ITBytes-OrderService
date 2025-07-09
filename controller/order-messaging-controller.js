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
  orderpayattempt: createTopicPublisher('order.pay.attempt', 'order', 'order-events', null),
  orderpaid: createTopicPublisher('order.paid', 'order', 'order-events', null),
  ordercreated: createTopicPublisher('order.created', 'order', 'order-events', null),
  ordercancelled: createTopicPublisher('order.cancelled', 'order', 'order-events', null),
}

const MessagingController = {
    paymentProcessing: async (req, res) => {
      try {
        const editedOrder = req.body
        editedOrder.paymentStatus = "processing";
        const order = await Order.findByIdAndUpdate(req.body._id, editedOrder, { new: true, runValidators: true });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.awknowledge = true;
        res.status(201).end();
      } catch (error) {
        console.error('Error processing payment.processing event:', err);
        // Reject and requeue the message on error
        // req.reject(true);
        res.awknowledge = false; // Set acknowledgment flag to false
        res.status(500).end();
      }
    },
    paymentSuccess: async (req, res) => {
      try {
        const editedOrder = req.body;
        editedOrder.paymentStatus = "paid";
        const order = await Order.findByIdAndUpdate(req.body._id, editedOrder, { new: true, runValidators: true });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        // Publish the order paid event
        await publisher.orderpaid(server.channel, Buffer.from(JSON.stringify(order)));
        res.awknowledge = true; // Set acknowledgment flag to true
        // End the response cycle
        res.status(201).end();
      } catch (err) {
        console.error('Error processing payment.success event:', err);
        // Reject and requeue the message on error
        // req.reject(true);
        res.awknowledge = false; // Set acknowledgment flag to false
        res.status(500).end();
      }
    },

}


module.exports = {
  server,
  publisher,
  MessagingController,
}