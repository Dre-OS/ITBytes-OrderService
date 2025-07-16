const Order = require("../model/order-model");
const OrderIn = require("../model/orderin-model");
const axios = require('axios');
const {server, publisher, audit} = require('./order-messaging-controller');


const orderControllerOut = {
    createOrder: async (req, res) => {
      try {
        console.log(req.body);
        const user = new Order(req.body);
        await user.save();
        // Publish the order created event
        publisher.ordercreated(server.channel, Buffer.from(JSON.stringify(req.body)));
        publisher.orderallocateattempt(server.channel, Buffer.from(JSON.stringify(user)));
        audit("createOrder", "orderAction", "success", `Order created with ID: ${user._id}`);
        res.status(201).json(user);
      } catch (err) {
        audit("createOrder", "orderAction", "error", `Failed to create order: ${err.message}`);
        res.status(400).json({ error: err.message });
      }
    },

    createOrderIn: async (req, res) => {
      try {
        console.log(req.body);
        const user = new Order(req.body);
        await user.save();
        // Publish the order created event
        // publisher.ordercreated(server.channel, Buffer.from(JSON.stringify(req.body)))
        audit("createOrderIn", "orderInAction", "success", `Order created with ID: ${user._id}`);

        res.status(201).json(user);
      } catch (err) {
        audit("createOrderIn", "orderInAction", "error", `Failed to create order: ${err.message}`);
        res.status(400).json({ error: err.message });
      }
    },

    getAllOrders: async (req, res) => {
      try {
        const orders = await Order.find();
        if(!orders){
            audit("getAllOrders", "orderAction", "error", `No orders found`);
            return res.status(404).json({ message: "No orders found" });
        } 
        audit("getAllOrders", "orderAction", "success", `Orders Fetched`);
        res.status(200).json(orders);
      } catch (err) {
        audit("getAllOrders", "orderAction", "error", `Failed to fetch orders: ${err.message}`);
        res.status(500).json({ error: err.message });
      }
    },

    getOrderById: async (req, res) => {
      try {
        const order = await Order.findById(req.params.id);
        if (!order) {
          audit("getOrderById", "orderAction", "error", `Order with ID ${req.params.id} not found`);
          return res.status(404).json({ error: "Order not found" });
        }
        res.status(200).json(order);
      } catch (err) {
        audit("getOrderById", "orderAction", "error", `Failed to get order with ID ${req.params.id}: ${err.message}`);
        res.status(500).json({ error: err.message });
      }
    },

    getOrderByCustomerId: async (req, res) => {
      try {
        const order = await Order.find({ customerId: req.params.customerId });
        if (!order) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(order);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    updateOrder: async (req, res) => {
      try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        // publisher.orderupdated(server.channel, Buffer.from(JSON.stringify(req.body)))
        if (order.status === "cancelled") {
          publisher.ordercancelled(server.channel, Buffer.from(JSON.stringify(order)));
        }else if (order.status === "delivered") {
          publisher.orderallocatesucess(server.channel, Buffer.from(JSON.stringify(order)));
        }

        if (!order) return res.status(404).json({ error: 'Order not found' });
        audit("updateOrder", "orderAction", "success", `Order updated with ID: ${req.params.id}`);
        res.json(order);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },
    updateOrderPaymentStatus: async (req, res) => {
      try {
        const { paymentStatus } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) {
          return res.status(404).json({ error: 'Order not found' });
        // } else if (order.paymentStatus !== 'paid') {
        //   return res.status(400).json({ error: 'Order payment status is not paid' });
        } else if (order.paymentStatus === 'paid') {
          return res.status(400).json({ error: 'Order payment status is already paid' });
        }

        order.paymentStatus = paymentStatus;

        const savedOrder = await order.save();

        if (!savedOrder) {
          return res.status(404).json({ error: 'Order not found' });
        }

        // const order = await Order.findByIdAndUpdate(req.params.id, { paymentStatus }, { new: true, runValidators: true });
        publisher.orderpayattempt(server.channel, Buffer.from(JSON.stringify(order)));
        

        // Publish the order paid event
        publisher.orderpaid(server.channel, Buffer.from(JSON.stringify(order)));
        res.status(200).json(order);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },
}

const orderControllerIn = {
    createOrder: async (req, res) => {
      try {
        // const response = await axios.get(`${process.env.SUPPLIER_URL}/api/supplier/product/${req.body.productId}`);
        const order = await OrderIn.create(req.body);
        if (!order) {
          return res.status(404).json({ error: "Order not created" });
        }
        res.status(201).json(order);
        // res.status(201).json(res.body);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },

    getAllOrders: async (req, res) => {
      try {
        const orders = await OrderIn.find();
        res.status(200).json(orders);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    // getOrderById: async (req, res) => {
    //   try {
    //     const order = await Order.findById(req.params.id);
    //     if (!order) {
    //       return res.status(404).json({ error: "Order not found" });
    //     }
    //     res.status(200).json(order);
    //   } catch (err) {
    //     res.status(500).json({ error: err.message });
    //   }
    // },
}

module.exports = {
  orderControllerOut,
  orderControllerIn
};