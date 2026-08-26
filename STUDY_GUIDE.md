# Members Only – Study Guide

This project is a minimal Express app that teaches **authentication and authorization** using Passport.js, bcrypt, and PostgreSQL sessions.

---

## 1. How a User Logs In (Passport.js)

```
Browser  →  POST /log-in  →  passport.authenticate('local')
                               ↓
                          LocalStrategy callback
                          1. findUserByEmail(email)
                          2. bcrypt.compare(password, hash)
                          3. done(null, user)  ← success
                               ↓
                          passport.serializeUser  →  stores user.id in session
                               ↓
                          req.session.passport = { user: 1 }  ← saved to DB
```

On every subsequent request:

```
Browser sends cookie  →  express-session reads session from DB
                       →  passport.deserializeUser(id)
                       →  findUserById(id)
                       →  req.user = { id, email, is_member, is_admin, ... }
```

**Key files:**
- `config/passport.js` – defines the LocalStrategy
- `app.js` – `passport.initialize()` + `passport.session()`

---

## 2. Passwords with bcrypt

```js
// Sign-up: hash before storing
const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds

// Log-in: compare plain vs hash — NEVER store/compare plain text
const match = await bcrypt.compare(plainPassword, hashedPassword);
```

The hash is **one-way** — you can never get the original password back from it. `saltRounds = 10` means 2^10 hashing iterations.

---

## 3. Sessions

Sessions let the server "remember" who you are between requests (HTTP is stateless).

```
1. User logs in  →  session created  →  session ID sent as cookie
2. Next request  →  browser sends cookie  →  server looks up session
3. Session row in DB: { sid, sess: { passport: { user: 42 } }, expire }
```

**connect-pg-simple** stores sessions in the `session` table (auto-created).

---

## 4. Authorization Levels

| User state        | Can see messages | Sees author + date | Can delete |
|-------------------|------------------|--------------------|------------|
| Guest (not logged in) | ✅           | ❌                 | ❌         |
| Logged-in, no membership | ✅        | ❌                 | ❌         |
| Member (`is_member = true`) | ✅     | ✅                 | ❌         |
| Admin (`is_admin = true`)  | ✅      | ✅                 | ✅         |

This is checked in `views/index.ejs`:
```ejs
<% if (user && (user.is_member || user.is_admin)) { %>
  <p>By <%= msg.first_name %> ...</p>
<% } %>
```

And in `middleware/auth.js` for route protection.

---

## 5. Middleware Pattern

```js
// middleware/auth.js
function requireLogin(req, res, next) {
  if (req.isAuthenticated()) return next(); // passport adds this
  res.redirect('/log-in');
}
```

`next()` passes control to the next middleware/route handler. This is the standard Express guard pattern.

---

## 6. Form Validation

`express-validator` runs validators before the controller logic:

```js
router.post('/sign-up', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('confirmPassword').custom((val, { req }) => {
    if (val !== req.body.password) throw new Error('Passwords do not match.');
    return true;
  }),
], async (req, res) => {
  const errors = validationResult(req); // collect all failures
  if (!errors.isEmpty()) return res.render('sign-up', { errors: errors.array() });
  // ... safe to proceed
});
```

---

## 7. Project Structure

```
app.js                  ← Express app entry point
config/
  passport.js           ← LocalStrategy definition
db/
  pool.js               ← pg connection pool
  queries.js            ← all SQL queries (no ORM)
  schema.sql            ← DB table definitions
middleware/
  auth.js               ← requireLogin, requireAdmin
routes/
  authRoutes.js         ← /sign-up, /log-in, /log-out
  memberRoutes.js       ← /join (membership passcode)
  messageRoutes.js      ← /, /new-message, /delete/:id
views/
  index.ejs             ← home page
  sign-up.ejs
  log-in.ejs
  join.ejs
  new-message.ejs
  partials/nav.ejs      ← shared navigation bar
```

---

## 8. Things to Try

1. Sign up as a regular user → notice no author shown on messages
2. Enter the membership passcode (`clubhouse123`) → refresh home → author appears
3. Sign up with `isAdmin` checkbox → delete button appears
4. Try navigating to `/new-message` while logged out → redirected to log-in
5. Look at `session` table in PostgreSQL: `SELECT * FROM session;`
6. Check `req.user` is populated by adding `console.log(req.user)` anywhere in a route

---

## Passcodes (dev only, never hardcode in production)

| What           | Passcode       |
|----------------|----------------|
| Membership     | `clubhouse123` |
| Admin          | *(checkbox on signup)* |
