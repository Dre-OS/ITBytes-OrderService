const mongoose = require('mongoose');

const orderInSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: false,
    },
    name: {
        type: String,
        required: false,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    product:{
        type: Object,
        required: true,
    }

}, { timestamps: true });

orderInSchema.pre('save', function(next) {
        // Calculate total price
        if (this.product && this.product.id && this.product.name) {
            this.name = this.product.name;
            this.productId = this.product.id;
        }
        next();
    }
);
    


const OrderIn = mongoose.model('OrderIn', orderInSchema);

module.exports = OrderIn;
