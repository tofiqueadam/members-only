const pool = require('./pool');

// --- Users ---

async function createUser({ firstName, lastName, email, hashedPassword, isAdmin }) {
  const { rows } = await pool.query(
    `INSERT INTO users (first_name, last_name, email, password, is_admin)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [firstName, lastName, email, hashedPassword, isAdmin || false]
  );
  return rows[0];
}

async function findUserByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
}

async function findUserById(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0];
}

async function setMembership(userId, status) {
  await pool.query('UPDATE users SET is_member = $1 WHERE id = $2', [status, userId]);
}

// --- Messages ---

async function getAllMessages() {
  const { rows } = await pool.query(
    `SELECT messages.*, users.first_name, users.last_name
     FROM messages
     JOIN users ON messages.user_id = users.id
     ORDER BY messages.created_at DESC`
  );
  return rows;
}

async function createMessage({ title, text, userId }) {
  await pool.query(
    'INSERT INTO messages (title, text, user_id) VALUES ($1, $2, $3)',
    [title, text, userId]
  );
}

async function deleteMessage(id) {
  await pool.query('DELETE FROM messages WHERE id = $1', [id]);
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  setMembership,
  getAllMessages,
  createMessage,
  deleteMessage,
};
