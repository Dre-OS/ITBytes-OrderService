const Order = require("../model/order-model");

const orderControllerOut = {
    createOrder: async (req, res) => {
      try {
        console.log(req.body);
        const user = new Order(req.body);
        await user.save();
        res.status(201).json(user);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },

    getAllOrders: async (req, res) => {
      try {
        const orders = await Order.find();
        res.status(200).json(orders);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    getOrderById: async (req, res) => {
      try {
        const order = await Order.findById(req.params.id);
        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }
        res.status(200).json(order);
      } catch (err) {
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
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },
}

const orderControllerIn = {
    createOrder: async (req, res) => {
      try {
        const response = await axios.get(req.body.url);
        res.status(201).json(response.data);
        // res.status(201).json(res.body);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },

    getAllOrders: async (req, res) => {
      try {
        const orders = await Order.find();
        res.status(200).json(orders);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    getOrderById: async (req, res) => {
      try {
        const order = await Order.findById(req.params.id);
        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }
        res.status(200).json(order);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },
}

module.exports = {
  orderControllerOut,
  orderControllerIn
};