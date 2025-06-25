const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  itemId: String,
  item: String,
  quantity: Number,
  price: Number,
  subtotal: {
    type: Number,
    default: function() {
      return this.price * this.quantity;
    }
  },
});

module.exports = orderItemSchema;