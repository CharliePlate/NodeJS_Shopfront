const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/user')
const {
  validationResult
} = require('express-validator/check')

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: req.flash('loginError')[0]
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({
      email: email
    })
    .then(user => {
      if (!user) {
        req.flash('loginError', 'Invalid email or password.');
        return res.redirect('/login');
      }
      bcrypt.compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user
            return req.session.save(() => {
              res.redirect('/');
            });
          }
          req.flash('loginError', 'Invalid email or password.')
          res.redirect('/login');
        })
        .catch(err => res.redirect('/login'));
    });
}

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect('/');

  })
}

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Sign Up',
    errorMessage: req.flash('signupError')[0],
    oldInput: { email: "", password:"", confirmPassword: "" }
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).
    render('auth/signup', {
      path: '/signup',
      pageTitle: 'Sign Up',
      errorMessage: errors.array()[0].msg,
      oldInput: { email:email, password:password, confirmPassword: confirmPassword }
    });
  }
      return bcrypt.hash(password, 12)
        .then(hashedPassword => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: {
              items: []
            }
          })
          return user.save()
        })
        .then(result => {
          res.redirect('/login')
        })
}


exports.getReset = (req, res, next) => {
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: req.flash('resetError')[0]
  })
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({
        email: req.body.email
      })
      .then(user => {
        if (!user) {
          req.flash('resetError', 'No account with email provided!')
          return res.redirect('/reset')
        }
        user.resetToken = token
        user.resetTokenExpire = Date.now() + 3600000
        return user.save()
          .then(result => {
            console.log({
              To: req.body.email,
              Subject: "Password Reset",
              html: `<p> You Requested a Password Reset</p>`
            })
            console.log(token)
            res.redirect('/')
          })
      })
      .catch(err => console.log(err));
  });
};


exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
      resetToken: token,
      resetTokenExpire: {
        $gt: Date.now()
      }
    })
    .then(user => {
      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: req.flash('signupError')[0],
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({
      resetToken: passwordToken,
      resetTokenExpire: {
        $gt: Date.now()
      },
      _id: userId
    })
    .then(user => {
      resetUser = user
      return bcrypt.hash(newPassword, 12)
        .then(hashedPassword => {
          resetUser.password = hashedPassword;
          resetUser.resetToken = undefined;
          resetUser.resetTokenExpire = undefined;
          return resetUser.save()
            .then(result => {
              res.redirect('/login')
            })
        })
    })
    .catch(err => console.log(err))
}