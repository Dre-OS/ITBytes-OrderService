const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
    required: false,
    default: function() {
        return this.item && this.item.price ? this.item.price * this.quantity : 0;
    },
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;