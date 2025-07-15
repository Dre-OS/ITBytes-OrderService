const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  itemId: String,
  name: String,
  quantity: Number,
  price: Number,
  subtotal: {
    type: Number,
    required: false,
  },
  allocated: {
    type: Boolean,
    default: false,
    required: false,
  },
});


// Calculate subtotal before saving
orderItemSchema.pre('save', function(next) {
  if (this.quantity < 0) {
    return next(new Error('Quantity cannot be negative'));
  }
  if (this.price < 0) {
    return next(new Error('Price cannot be negative'));
  }
  // Calculate subtotal
  if (this.quantity === undefined || this.price === undefined) {
    return next(new Error('Quantity and price must be defined'));
  }
  if (typeof this.quantity !== 'number' || typeof this.price !== 'number') {
    return next(new Error('Quantity and price must be numbers'));
  }
  if (this.quantity === 0 || this.price === 0) {
    this.subtotal = 0;
    return next();
  }
  this.subtotal = this.price * this.quantity;
  next();
});

// Add a virtual getter for subtotal
orderItemSchema.virtual('calculatedSubtotal').get(function() {
  return this.price * this.quantity;
});

module.exports = orderItemSchema;