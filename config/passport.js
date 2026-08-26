const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { findUserByEmail, findUserById } = require('../db/queries');

// The strategy checks email + password
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await findUserByEmail(email);
      if (!user) return done(null, false, { message: 'No user with that email.' });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: 'Wrong password.' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Store only the user id in the session cookie
passport.serializeUser((user, done) => done(null, user.id));

// On each request, look the user up by id from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await findUserById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
