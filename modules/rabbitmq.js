const amqplib = require('amqplib');

const rabbitmqUrl = 'amqp://localhost'; // Update with your RabbitMQ URL

async function connectRabbitMQ() {
    try {
        const connection = await amqplib.connect(rabbitmqUrl);
        const channel = await connection.createChannel();
        
        // Declare a queue
        const queue = 'order_queue';
        await channel.assertQueue(queue, { durable: true });
    
        console.log('Connected to RabbitMQ and queue is ready:', queue);
        
        return { connection, channel, queue };
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
        throw error;
    }
    }
async function publishToTopic(channel, exchange, routingKey, message) {
    try {
        // Ensure the topic exchange exists
        await channel.assertExchange(exchange, 'topic', { durable: true });
        
        const msgBuffer = Buffer.from(JSON.stringify(message));
        channel.publish(exchange, routingKey, msgBuffer, { persistent: true });
        console.log('Message published to topic:', { exchange, routingKey, message });
    } catch (error) {
        console.error('Error publishing message to topic:', error);
    }
}

async function subscribeToTopic(channel, exchange, routingPattern, callback) {
    try {
        // Ensure the topic exchange exists
        await channel.assertExchange(exchange, 'topic', { durable: true });
        
        // Create an anonymous queue
        const { queue } = await channel.assertQueue('', { exclusive: true });
        
        // Bind the queue to the exchange with the routing pattern
        await channel.bindQueue(queue, exchange, routingPattern);
        
        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const message = JSON.parse(msg.content.toString());
                console.log('Message received from topic:', { 
                    exchange, 
                    routingKey: msg.fields.routingKey,
                    message 
                });
                callback(message, msg.fields.routingKey);
                channel.ack(msg); // Acknowledge the message
            }
        });
        console.log('Waiting for messages with pattern:', routingPattern);
    } catch (error) {
        console.error('Error subscribing to topic:', error);
    }
}

// Export the functions for use in other modules
module.exports = {
    connectRabbitMQ,
    publishToTopic,
    subscribeToTopic
};