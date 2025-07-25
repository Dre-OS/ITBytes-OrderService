const mongoose = require('mongoose');
const orderitem = require('./orderitem-model');

const orderSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
    index: true,
  },
  orders: {
    type: [orderitem],
    required: true,
  },
  totalPrice: {
    type: Number,
    required: false,
    default: 0,
  },
  status: {
    type: String,
    enum: ['cancelled', 'returned', 'pending', 'confirmed', 'processing', 'placed','shipped','delivering','delivered'], 
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  editable: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

orderSchema.pre('save', function(next) {
  // Calculate subtotal for each order item
  if (this.orders && this.orders.length > 0) {
    this.orders.forEach(item => {
      item.subtotal = item.price * item.quantity;
    });
  }
  
  // Calculate total price
  this.totalPrice = this.orders.reduce((total, item) => total + item.subtotal, 0);
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;