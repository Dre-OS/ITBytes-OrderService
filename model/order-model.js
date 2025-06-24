const mongoose = require('mongoose');
const orderitem = require('./orderitem-model');

const userSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
  },
  orders: {
    type: [orderitem],
    required: true,
  },
  totalprice: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['placed','shipped','delivering','delivered'], 
    default: 'placed',
  },
  ispayed: {
    type: Boolean,
    default: false,
  },
  editable: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;