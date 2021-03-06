var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

var User = require('../server/models/user');

var configAuth = require('./auth');

module.exports = function(passport) {
  passport.use(new BearerStrategy(
    function(token, done) {
      User.findOne({ 'google.token': token }, function(err, user) {
        if(err) {
          return done(err)
        }
        if(!user) {
          return done(null, false)
        }

        return done(null, user, { scope: 'all' })
      });
    })
);

  passport.use(new GoogleStrategy({
    clientID        : configAuth.googleAuth.clientId,
    clientSecret    : configAuth.googleAuth.clientSecret,
    callbackURL     : configAuth.googleAuth.callbackURL,
  },
  function(token, refreshToken, profile, done) {
    // make the code asynchronous
    // User.findOne won't fire until we have all our data back from Google
    process.nextTick(function() {

      // try to find the user based on their google id
      User.findOne({ 'google.id' : profile.id }, function(err, user) {
        if (err)
          return done(err);

        if (user) {

          // if a user is found, log them in
          return done(null, user);
        } else {
          // if the user isnt in our database, create a new user
          var newUser          = new User();

          // set all of the relevant information
          newUser.google.id    = profile.id;
          newUser.google.token = token;
          newUser.google.name  = profile.displayName;
          newUser.google.email = profile.emails[0].value; // pull the first email

          // save the user
          newUser.save(function(err) {
            if (err)
              throw err;
            return done(null, newUser);
          });
        }
      });
    });
  }));
};
