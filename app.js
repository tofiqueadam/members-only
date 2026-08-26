require('dotenv').config();
const express  = require('express');
const session  = require('express-session');
const passport = require('./config/passport');
const pgSession = require('connect-pg-simple')(session);
const pool     = require('./db/pool');

const authRoutes    = require('./routes/authRoutes');
const memberRoutes  = require('./routes/memberRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

// ── View engine ────────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', './views');

// ── Body parsing ───────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: false }));

// ── Session ────────────────────────────────────────────────────────────────────
// Sessions are stored in PostgreSQL so they survive restarts
app.use(session({
  store: new pgSession({ pool, createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
}));

// ── Passport ───────────────────────────────────────────────────────────────────
// passport.initialize() sets up passport on each request
// passport.session()    reads req.session.passport.user and calls deserializeUser
app.use(passport.initialize());
app.use(passport.session());

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/', authRoutes);
app.use('/', memberRoutes);
app.use('/', messageRoutes);  // home + new-message + delete

// ── Global error handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Something went wrong.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
