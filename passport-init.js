var mongoose = require('mongoose');
var User = mongoose.model('User');

var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport) {

    //Serialization and Deserialization of user using the passport native methods
    passport.serializeUser(function(user, done) {
        console.log('serializing user:', user._id, user.username);
        return done(null, user._id);
    });
    passport.deserializeUser(function(id, done) {

        User.findById(id, function(err, user) {
            console.log('deserializing user: ', user.username);
            done(err, user);
        });
    });

    //Setting up Own Login Strategy for Passport.JS
    passport.use('login', new LocalStrategy({
            passReqToCallback: true
        },
        function(req, username, password, done) {

            User.findOne({ username: username }, function(err, user) {
                if (err) {
                    return done(err);
                }

                if (!user) {
                    console.log('User Not Found with username ' + username);
                    return done(null, false);
                }

                if (!isValidPassword(user, password)) {
                    console.log('Invalid Password');
                    return done(null, false);
                }

                return done(null, user);
            })
        }
    ));

    //Setting up Own SignUp Strategy for Passport.JS
    passport.use('signup', new LocalStrategy({
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            User.findOne({ username: username }, function(err, user) {
                if (err) {
                    console.log('db error ' + err);
                    return done(err);
                }

                if (user) {
                    //Already signed this user
                    console.log('user already exists with username: ' + username);
                    return done(null, false);
                } else {

                    var user = new User();

                    user.username = username;
                    user.password = createHash(password);

                    user.save(function(err) {
                        if (err) {
                            throw err;
                        }
                        console.log('successfully signed up user ' + user.username);
                        return done(null, user);
                    })
                }
            });
        }));

    //Check Password using bCrypt
    var isValidPassword = function(user, password) {
        return bCrypt.compareSync(password, user.password);
    };
    // Generates hash using bCrypt
    var createHash = function(password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };
};