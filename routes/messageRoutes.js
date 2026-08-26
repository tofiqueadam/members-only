const express = require('express');
const router = express.Router();
const { requireLogin, requireAdmin } = require('../middleware/auth');
const { getAllMessages, createMessage, deleteMessage } = require('../db/queries');
const { body, validationResult } = require('express-validator');

// ── Home – list all messages ───────────────────────────────────────────────────

router.get('/', async (req, res) => {
  const messages = await getAllMessages();
  res.render('index', { messages, user: req.user });
});

// ── New message ────────────────────────────────────────────────────────────────

router.get('/new-message', requireLogin, (req, res) => {
  res.render('new-message', { errors: [] });
});

router.post('/new-message', requireLogin, [
  body('title').trim().notEmpty().withMessage('Title is required.'),
  body('text').trim().notEmpty().withMessage('Message text is required.'),
], async (req, res) => {
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

router.post('/delete/:id', requireAdmin, async (req, res) => {
  await deleteMessage(req.params.id);
  res.redirect('/');
});

module.exports = router;
