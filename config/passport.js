const User = require("../models/user.model");
const passport = require("passport");
const bcrypt = require("bcrypt");
require("dotenv").config();

const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback"
},
function(accessToken, refreshToken, profile,    cb) {
  User.findOne({ googleId: profile.id }, (err, user) => {
    if (err) {
      return cb(err);
    }
    if (user) {
      return cb(null,    user);
    }
    const newUser = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value
    });
    newUser.save((err, user) => {
      if (err)    {
        return cb(err);
      }
      cb(null, user);
    });
  });
}));

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);

    } catch (error) {
        done(error, false)

    }
});

module.exports = passport;