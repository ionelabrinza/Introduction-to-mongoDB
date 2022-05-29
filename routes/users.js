const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');
const router = express.Router();

/* GET users listing. */

//endpoint for users path - task 3 

router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
   User.find()
   .then(user => {
     res.statusCode = 200;
     res.setHeader('Content-Type' ,'application/json');
     res.json(user);
   })
   .catch(err => next(err));
});


//endpoint for signup path
router.post('/signup', (req, res) => {
    User.register(
      new User({username: req.body.username}),
      req.body.password,
      (err, user) => {
        if  (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type' ,'application/json');
            res.json({err:err});
        } else {
          if(req.body.firstname) {
            user.firstname=req.body.firstname;
          }
          if(req.body.lastname) {
            user.lastname=req.body.lastname;
          }
          user.save(err => {
            if(err) {
              res.statusCode = 500;
              res.setHeader('Content-Type' ,'application/json');
              res.json({err:err});
              return;
            }
            passport.authenticate('local')(req, res, ()=> {
              res.statusCode =200;
              res.setHeader('Content-Type', 'application/json');
              res.json({success: true, status: 'Registration Successful!'});
          });
        })
       }
      }
    );
});


router.post('/login', passport.authenticate('local'), (req, res) => {
    const token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in'});

});

router.get('/logout', (req, res, next) => {
    if (req.session) {
        req.session.destroy();
        res.clearCookie('session-id');
        res.redirect('/');
    } else {
        const err = new Error('You are not logged in!');
        err.status = 401;
        return next(err);
    }
});

module.exports = router;
