const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  itemId: String,
  item: String,
  quantity: Number,
  price: Number,
  subtotal: {
    type: Number,
    required: false,
  }
});


// Calculate subtotal before saving
orderItemSchema.pre('save', function(next) {
  this.subtotal = this.price * this.quantity;
  next();
});

// Add a virtual getter for subtotal
orderItemSchema.virtual('calculatedSubtotal').get(function() {
  return this.price * this.quantity;
});

module.exports = orderItemSchema;