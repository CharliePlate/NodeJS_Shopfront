const {
    ChangeStream
} = require('mongodb');
const mongoose = require('mongoose');
const Product = require('./product')
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpire: Date,
    cart: {
        items: [{
            product: {
                type: Schema.Types.ObjectID,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }]
    }
});

userSchema.methods.checkCart = function () {
    let newcart = []
    let updatedCart = [...this.cart.items].filter(p => !p.product)
    const updatedCartItems = this.cart.items.filter(p => !(updatedCart.map(i => i._id).includes(p._id)))
    updatedCartItems.forEach(item => newcart.push({
        product: item.product._id,
        quantity: item.quantity
    }))
    newcart = {
        items: [...newcart]
    }
    console.log(newcart)
    this.cart = newcart
    return this.save()
}

userSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.product.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            product: product._id,
            quantity: newQuantity
        });
    }
    const updatedCart = {
        items: updatedCartItems
    };
    this.cart = updatedCart
    return this.save()
}

userSchema.methods.removeFromCart = function (productId) {
    const updatedCartItems = this.cart.items.filter(item => {
        return item.product.toString() != productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
};

userSchema.methods.clearCart = function () {
    this.cart = {
        items: []
    }
    this.save()
}


module.exports = mongoose.model('User', userSchema)


//     addToCart(product) {
//         const cartProductIndex = this.cart.items.findIndex(cp => {
//           return cp.productId.toString() === product._id.toString();
//         });
//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items];

//         if (cartProductIndex >= 0) {
//           newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//           updatedCartItems[cartProductIndex].quantity = newQuantity;
//         } else {
//           updatedCartItems.push({
//             productId: new ObjectId(product._id),
//             quantity: newQuantity
//           });
//         }
//         const updatedCart = {
//           items: updatedCartItems
//         };
//         const db = getDb();
//         return db
//           .collection('users')
//           .updateOne(
//             { _id: new ObjectId(this._id) },
//             { $set: { cart: updatedCart } }
//           );
//       }

//     getCart() {
//         const db = getDb();
//         let productIds = this.cart.items.map(i => i.productId);
//         return db
//         .collection('products')
//         .find({ _id: { $in: productIds } })
//         .toArray()
//         .then(products => {
//             if (productIds.length > products.length) {
//                 let updatedCart = [...this.cart.items]
//                 updatedCart = {items: updatedCart.filter(p => products.map(i=>i._id.toString()).indexOf(p.productId.toString()) != -1)}
//                 db.collection('users').updateOne({ _id: new ObjectId(this._id) },{ $set: { cart: updatedCart } });
//             }
//             return products.map(p => {
//                 return {
//                     ...p,
//                     quantity: (this.cart.items.find(i => i.productId.toString() === p._id.toString())).quantity
//                 }
//             });
//         });
//     };

//     addOrder() {
//         const db = getDb();
//         return this.getCart()
//         .then(products => {
//             const order = {
//                 items: products,
//                 user: {
//                     _id: new ObjectId(this._id),
//                     name: this.name
//                 }
//             };
//             return db.collection('orders').insertOne(order)
//         })
//         .then(result => {
//             this.cart = {items: []};
//             return db.collection('users')
//             .updateOne(
//                 { _id: new ObjectId(this._id) }, 
//                 {$set: {cart: {items: []}}})
//         })
//         .catch(err => console.log(err));
//     };



//     getOrders() {
//         const db = getDb();
//         return db.collection('orders')
//         .find({'user._id': this._id})
//         .toArray();
//     }

//     deleteFromCart(prodId) {
//         const db = getDb();
//         const updatedCartItems = this.cart.items.filter(prod => prod.productId.toString() != prodId.toString())
//         return db.collection('users').updateOne({ _id: new ObjectId(this._id) }, {$set: {cart: {items: updatedCartItems}}})
//     }

//     static findById(id){
//         const db = getDb();
//         return db.collection('users').find({ _id: new ObjectId(id) })
//         .next()
//         .then(user => user)
//     }
// }

// module.exports = User;