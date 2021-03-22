const express = require('express');
const User = require('../models/user');
const {check, body} = require('express-validator')
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/signup', authController.getSignup);

router.post('/signup',
    body('email').isEmail().withMessage('Please enter a valid email.'),
    body('email').custom((value, {req}) => {
    return User.findOne({email: value})
    .then(user => {
      if (user) {
          return Promise.reject('Email already exists')
      }
    });
   }),
    body('password').isLength({
        min: 6
    }).withMessage('Password must be 6 characters long.'),
    body('confirmPassword').custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match')
        }
        return true;
    }),
    authController.postSignup
);

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', authController.postLogout);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset)
router.get('/reset/:token', authController.getNewPassword)
router.post('/new-password', authController.postNewPassword)


module.exports = router;

