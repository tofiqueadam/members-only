# Members Only

An exclusive clubhouse app. Members can post anonymously — guests see the message but not the author.

## Tech Stack

- **Node.js / Express** – server
- **PostgreSQL** – database + session store
- **Passport.js (LocalStrategy)** – authentication
- **bcrypt** – password hashing
- **express-validator** – input validation
- **EJS** – templating

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create the database
psql -c "CREATE DATABASE members_only;"
psql -d members_only -f db/schema.sql

# 3. Configure environment
cp .env.example .env   # edit values as needed

# 4. Run
npm start              # http://localhost:3000
```

## Environment Variables

| Variable            | Description                          |
|---------------------|--------------------------------------|
| `DB_NAME`           | PostgreSQL database name             |
| `SESSION_SECRET`    | Secret for signing session cookies   |
| `MEMBERSHIP_PASSCODE` | Passcode to become a member        |
| `PORT`              | Server port (default 3000)           |

## Features

- Sign-up / Log-in / Log-out
- Membership via secret passcode
- Admin flag (checkbox on sign-up)
- Create messages (logged-in users)
- See author + date (members & admins only)
- Delete messages (admins only)

See **STUDY_GUIDE.md** for a deep dive into how authentication works.
