const mongoose = require('mongoose'); const Schema = mongoose.Schema;

const orderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectID,
        ref: 'user',
        required: true
    },
    items: [{
        product: {
            type: Object,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            require: true
        }
    }]
});


module.exports = mongoose.model('Order', orderSchema)