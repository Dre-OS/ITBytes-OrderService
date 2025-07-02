// IMPORTANT: Put these code snippets in index.js
const rabbitExpress = require('rabbitmq-express');
const messagingModule = require('rabbitmq-express-messaging');
const { use } = require('react');


// Required for RabbitMQ listener
// const messagingConfig = {
//   rabbitURI: process.env.AMQP_URI || 'amqp://guest:guest@localhost:5672',
//   exchangeType: 'topic',
// }

// listening for events in each module
// change exchange, queue and routingKey as per your module

// EXAMPLE FOR THE PROGRAM (Listeing to order Events):
// messagingOrders.listen({
//   ...messagingOrdersConfig,
//   exchange: 'order',
//   queue: 'order-events',
//   routingKey: 'order.*', // This will catch all order events
//   consumerOptions: { noAck: false }, // Enable explicit acknowledgments
// });

// ANOTHER EXAMPLE AS A FORMAT (Listening to {this_module_name} Events):
// messagingModule.listen({
//   ...messagingModuleConfig,
//   exchange: 'module',
//   queue: 'modlue-events',
//   routingKey: 'module.*', // This will catch all order events
//   consumerOptions: { noAck: false }, // Enable explicit acknowledgments
// });

// index.js event listener usage:
// messagingModule.use('routingKey', moduleListenerEvents.eventDoneOne);




moduleListenerEvents = {
    // Copy paste this for an event
    eventDoneOne: (req, res, next) => {
    try {
        console.log('Processing order.created event: ' + JSON.stringify(req.body));

        // Simulate processing the event

        res.awknowledge = true; // Set acknowledgment flag to true
        
        // End the response cycle
        res.status(201).end();
    } catch (error) {
        console.error('Error processing order.created event:', error);

        res.awknowledge = false; // Set acknowledgment flag to false
        res.status(500).end();
    }
    },
}



module.exports = {moduleListenerEvents}