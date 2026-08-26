const express = require('express');
const router = express.Router();
const { getAllMessages, createMessage, deleteMessage } = require('../db/queries');
const { body, validationResult } = require('express-validator');

// ── Home – list all messages ───────────────────────────────────────────────────

router.get('/', async (req, res) => {
  const messages = await getAllMessages();
  res.render('index', { messages, user: req.user });
});

// ── New message ────────────────────────────────────────────────────────────────

router.get('/new-message', (req, res) => {
  if (!req.user) return res.redirect('/log-in');
  res.render('new-message', { errors: [] });
});

router.post('/new-message', [
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('text').trim().notEmpty().withMessage('Message text is required.'),
], async (req, res) => {
  if (!req.user) return res.redirect('/log-in');

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('new-message', { errors: errors.array() });
  }

  await createMessage({
    title: req.body.title,
    text: req.body.text,
    userId: req.user.id,
  });
  res.redirect('/');
});

// ── Delete message (admin only) ────────────────────────────────────────────────

router.post('/delete/:id', async (req, res) => {
  if (!req.user || !req.user.is_admin) return res.status(403).send('Forbidden');
  await deleteMessage(req.params.id);
  res.redirect('/');
});

module.exports = router;
