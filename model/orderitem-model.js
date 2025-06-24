const mongoose = require('mongoose');

const orderitemSchema = new mongoose.Schema({
  itemid: {
    type: Number,
    index: true,
    required: false,
  },
  item: {
    type: Object,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  price: {
    type: Number,
    default: item => item.price || 0,
  },
  subtotal: {
    type: Number,
    required: false,
    default: function() {
        return this.price * this.quantity;
    },
  },
});

const OrderItem = mongoose.model('OrderItem', orderitemSchema);

module.exports = OrderItem;