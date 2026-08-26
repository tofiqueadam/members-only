const express = require('express');
const router = express.Router();
const { setMembership } = require('../db/queries');
require('dotenv').config();

// ── Join the club ──────────────────────────────────────────────────────────────

router.get('/join', (req, res) => {
  if (!req.user) return res.redirect('/log-in');
  res.render('join', { error: null, success: null });
});

router.post('/join', async (req, res) => {
  if (!req.user) return res.redirect('/log-in');

  const { passcode } = req.body;

  if (passcode === process.env.MEMBERSHIP_PASSCODE) {
    await setMembership(req.user.id, true);
    return res.render('join', { error: null, success: 'Welcome to the club! 🎉' });
  }

  res.render('join', { error: 'Wrong passcode. Try again.', success: null });
});

module.exports = router;
