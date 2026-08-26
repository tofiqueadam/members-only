const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('../config/passport');
const { body, validationResult } = require('express-validator');
const { createUser } = require('../db/queries');
require('dotenv').config();

// ── Sign-up ────────────────────────────────────────────────────────────────────

router.get('/sign-up', (req, res) => {
  res.render('sign-up', { errors: [], data: {} });
});

router.post('/sign-up', [
  body('firstName').trim().notEmpty().withMessage('First name is required.'),
  body('lastName').trim().notEmpty().withMessage('Last name is required.'),
  body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match.');
    return true;
  }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('sign-up', { errors: errors.array(), data: req.body });
  }

  try {
    const { firstName, lastName, email, password, isAdmin } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    // isAdmin checkbox only adds admin flag — does NOT grant membership
    await createUser({
      firstName,
      lastName,
      email,
      hashedPassword,
      isAdmin: isAdmin === 'on',
    });
    res.redirect('/log-in');
  } catch (err) {
    // Duplicate email
    if (err.code === '23505') {
      return res.render('sign-up', {
        errors: [{ msg: 'Email already in use.' }],
        data: req.body,
      });
    }
    throw err;
  }
});

// ── Log-in ─────────────────────────────────────────────────────────────────────

router.get('/log-in', (req, res) => {
  res.render('log-in', { error: req.flash ? req.flash('error')[0] : null });
});

router.post('/log-in',
  (req, res, next) => {
    // passport.authenticate as middleware so we can handle failure ourselves
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        // Re-render the login page with the error message from the strategy
        return res.render('log-in', { error: info?.message || 'Invalid credentials.' });
      }
      req.logIn(user, err => {
        if (err) return next(err);
        res.redirect('/');
      });
    })(req, res, next);
  }
);

// ── Log-out ────────────────────────────────────────────────────────────────────

router.get('/log-out', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

module.exports = router;
