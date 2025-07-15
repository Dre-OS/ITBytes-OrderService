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
  auditError: createTopicPublisher(
    "audit.error",
    "audit",
    "audit-events",
    null
  ),
  auditInfo: createTopicPublisher(
    "audit.info",
    "audit",
    "audit-events",
    null
  ),
  orderpayattempt: createTopicPublisher('order.pay.attempt', 'order', 'order-events', null),
  orderpayattemptfailed: createTopicPublisher('order.pay.attempt.failed', 'order', 'order-events', null),
  // orderpaid: createTopicPublisher('order.paid', 'order', 'order-events', null),
  orderallocateattempt: createTopicPublisher('order.allocate.attempt', 'order', 'order-events', null),
  orderallocatefailed: createTopicPublisher('order.allocate.failed', 'order', 'order-events', null),
  orderallocatesucess: createTopicPublisher('order.allocate.success', 'order', 'order-events', null),
  // orderprocessing: createTopicPublisher('order.processing', 'order', 'order-events', null),
  ordercreated: createTopicPublisher('order.created', 'order', 'order-events', null),
  ordercancelled: createTopicPublisher('order.cancelled', 'order', 'order-events', null),
}

function audit(action, from, status, message) {
  const auditFormat = {
    action: action,
    from: from,
    status: status,
    message: message
  }

  if (status === "error") {
    publisher.auditError(
      server.channel,
      Buffer.from(JSON.stringify(auditFormat))
    );
  } else {
    publisher.auditInfo(
      server.channel,
      Buffer.from(JSON.stringify(auditFormat))
    );
  }
  console.log(`Audit log: ${action} - ${from} - ${status} - ${message}`);
  return auditFormat;
}


const MessagingController = {
    paymentProcessing: async (req, res) => {
      try {
        const editedOrder = req.body
        editedOrder.paymentStatus = "processing";
        const order = await Order.findByIdAndUpdate(req.params.id, editedOrder, { new: true, runValidators: true });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        audit('paymentProcessing', 'paymentEvents', 'info', `Order ${order._id} payment processing started`);
        res.awknowledge = true;
        res.status(201).end();
      } catch (error) {
        console.error('Error processing payment.processing event:', err);
        publisher.orderpayattemptfail(server.channel, Buffer.from(JSON.stringify(req.body)));
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
        audit('paymentSuccess', 'paymentEvents', 'info', `Order ${order._id} payment successfully processed`);
        // Publish the order paid event
        // await publisher.orderpaid(server.channel, Buffer.from(JSON.stringify(order)));
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
    paymentFailed: async (req, res) => {
      try {
        const editedOrder = req.body;
        editedOrder.paymentStatus = "failed";
        const order = await Order.findByIdAndUpdate(req.body._id, editedOrder, { new: true, runValidators: true });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        // Publish the order paid event
        publisher.orderpayattemptfailed(server.channel, Buffer.from(JSON.stringify(order)));
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
    inventoryStockUpdate: async (req, res) => {
      try {
        const order = req.body;
        if (!order.orders || !Array.isArray(order.orders) || order.orders.length === 0) {
          console.error('Invalid orders data:', order);
          res.awknowledge = false; // Set acknowledgment flag to false
          return res.status(400).end(); // Bad request if orders are not valid
        }
        // Update the allocated status of each order item to true
        // Assuming orders is an array of order items
        if (!Array.isArray(order.orders)) {
          console.error('Orders should be an array:', order.orders);
          res.awknowledge = false; // Set acknowledgment flag to false
          return res.status(400).end(); // Bad request if orders are not valid
        }
        order.orders = order.orders.map(item => {
          return {
            ...item,
            allocated: true // Set allocated to true for each order item
          };
        })
        order = await Order.findByIdAndUpdate(req.params.id, order, { new: true, runValidators: true });
        if (!order) {
          console.error('Order not found for ID:', req.params.id);
          res.awknowledge = false; // Set acknowledgment flag to false
          return res.status(404).end(); // Not found if order does not exist
        }
        // Publish the order updated event
        // await publisher.orderupdated(server.channel, Buffer.from(JSON.stringify(req.body)));
        res.awknowledge = true; // Set acknowledgment flag to true
        res.status(200).end();
      }
      catch (err) {
        console.error('Error processing inventory.stock.update event:', err);
        res.awknowledge = false; // Set acknowledgment flag to false
        res.status(500).end();
    }
  }

}


module.exports = {
  server,
  publisher,
  audit,
  MessagingController,
}