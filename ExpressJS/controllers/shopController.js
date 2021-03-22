const Product = require('../models/product')
const Order = require('../models/order')

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/products', {
                prods: products,
                pageTitle: 'Products',
                path: '/products',
            });
        });
};

exports.getIndex = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
            });
        });
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            res.render('shop/product-details', {
                prod: product,
                pageTitle: product.title + ' Details',
                path: '/products',
            })
        })
        .catch(err => console.log(err))
};


exports.getCart = (req, res, next) => {
    req.user
    .populate('cart.items.product')
    .execPopulate()
    .then(user => {
        let products = user.cart.items;
        if(products.map(p => p.product).includes(null)) {
            req.user.checkCart()
            return this.getCart()
        }
        res.render('shop/cart', {
            products: products,
            pageTitle: 'Cart',
        })
    })
    .catch(err => console.log(err))
}
    

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId
    Product.findById(prodId)
    .then(product => {
        return req.user.addToCart(product)
    })
    .then(result => res.redirect('/cart'))
    .catch(err => console.log(err));
}

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.product;
    req.user.removeFromCart(prodId)
    .then(result => res.redirect('/cart'))
}

exports.getOrders = (req, res, next) => {
    Order.find( {userId: req.user._id} )
    .then(orders => {
         res.render('shop/orders', {
         pageTitle: "orders",
         path: '/orders',
         orders: orders,
         isAuthenticated: req.session.isLoggedIn
         })
     })
     .catch(err => console.log(err));

}

exports.postOrders = (req, res, next) => {
    req.user
    .populate('cart.items.product')
    .execPopulate()
    .then(user => {
        const products = user.cart.items;
        const order = new Order({
            userId: req.user,
            items: products
        })
        return order.save();
    })
    .then(order => {
        req.user.clearCart()
    })
    .then(result => res.redirect('/orders'))
}
    
exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout',
        isAuthenticated: req.session.isLoggedIn
    })
}