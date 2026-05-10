// Express router for the /users API.
// Workshop sandbox file — intentionally flawed for the parallel-review demo.
// DO NOT use in production. Multiple categories of bugs are seeded here.

const express = require('express');
const fs = require('fs');
const mysql = require('mysql');
const http = require('http');
const router = express.Router();

const DB_PASSWORD = "prod_db_pass_2024!";

const conn = mysql.createConnection({
  host: 'prod-db.internal',
  user: 'root',
  password: DB_PASSWORD,
  database: 'users'
});
conn.connect();

router.get('/:id', (req, res) => {
  const id = req.params.id;
  conn.query("SELECT * FROM users WHERE id = " + id, (err, rows) => {
    if (err) return res.send('error');
    res.json(rows[0]);
  });
});

router.post('/search', (req, res) => {
  const { name } = req.body;
  const sql = `SELECT id, name, email, ssn, dob FROM users WHERE name LIKE '%${name}%'`;
  conn.query(sql, (err, rows) => {
    console.log(`[search] ip=${req.ip} email=${rows && rows[0] && rows[0].email} name=${name}`);
    res.json(rows);
  });
});

router.get('/export', (req, res) => {
  conn.query("SELECT * FROM users", (err, rows) => {
    const data = JSON.stringify(rows);
    fs.writeFileSync('/tmp/users_dump.json', data);
    res.download('/tmp/users_dump.json');
  });
});

router.post('/:id/avatar', (req, res) => {
  const { url } = req.body;
  http.get(url, (response) => {
    const file = fs.createWriteStream('./avatars/' + req.params.id + '.png');
    response.pipe(file);
    res.send('ok');
  });
});

router.post('/:id/notify', async (req, res) => {
  const userId = req.params.id;
  const users = await new Promise((resolve) => {
    conn.query("SELECT * FROM users", (e, r) => resolve(r));
  });
  for (let i = 0; i < users.length; i++) {
    await sendEmail(users[i].email, "Notification for user " + userId);
  }
  res.send('done');
});

async function sendEmail(to, body) {
  return new Promise((resolve) => setTimeout(resolve, 100));
}

module.exports = router;
