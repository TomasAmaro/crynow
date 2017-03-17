var express = require('express');
var router = express.Router();

module.exports = function(passport) {

    //Returns the Authentication to be checked on the value of state key
    router.get('/success', function(req, res) {
        res.send({ state: 'success', user: req.user ? req.user : null });
    });

    router.get('/failure', function(req, res) {
        res.send({ state: 'failure', user: null, message: 'Invalid username or password' });
    });

    //Login - Check passport-init file for Strategies
    router.post('/login', passport.authenticate('login', {
        successRedirect: '/auth/success',
        failureRedirect: '/auth/failure'
    }));
    //SignUp - Check passport-init file for Strategies
    router.post('/signup', passport.authenticate('signup', {
        successRedirect: '/auth/success',
        failureRedirect: '/auth/failure'
    }));

    //LogOut - Using the native logout() from express
    router.get('/signout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    return router;
}