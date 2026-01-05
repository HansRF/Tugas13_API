const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("./db");
const router = express.Router();

const { auth, adminOnly } = require("./middleware");

/* ==========================
   UPDATE PROFILE (USERNAME)
   user cuma bisa update diri sendiri
========================== */
router.patch("/", auth, (req, res) => {
  const { username } = req.body;

  if (!username)
    return res.status(400).json({ message: "Username wajib diisi" });

  db.run(
    `UPDATE users SET username = ? WHERE id = ?`,
    [username, req.user.id],
    function (err) {
      if (err)
        return res.status(400).json({ message: "Username sudah dipakai" });

      if (this.changes === 0)
        return res.status(404).json({ message: "User tidak ditemukan" });

      res.json({ message: "Username berhasil diupdate" });
    }
  );
});

/* ==========================
   UPDATE PASSWORD
========================== */
router.patch("/:id/password", auth, (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (req.user.id != req.params.id) {
    return res
      .status(403)
      .json({ message: "Tidak boleh ubah password user lain" });
  }

  db.get(
    `SELECT * FROM users WHERE id = ?`,
    [req.params.id],
    (err, user) => {
      if (!user)
        return res.status(404).json({ message: "User tidak ditemukan" });

      if (!bcrypt.compareSync(oldPassword, user.password)) {
        return res.status(400).json({ message: "Password lama salah" });
      }

      const hashed = bcrypt.hashSync(newPassword, 10);

      db.run(
        `UPDATE users SET password = ? WHERE id = ?`,
        [hashed, req.params.id],
        () => {
          res.json({ message: "Password berhasil diubah" });
        }
      );
    }
  );
});

/* ==========================
   GET ALL USERS (ADMIN)
========================== */
router.get("/all", auth, adminOnly, (req, res) => {
  let query = `SELECT id, username, password, role, data_added FROM users`;
  const params = [];

  if (req.query.sort_by === "data_added") {
    query += ` ORDER BY data_added ASC`;
  }

  if (req.query.limit) {
    query += ` LIMIT ?`;
    params.push(parseInt(req.query.limit));
  }

  db.all(query, params, (err, rows) => {
    if (err)
      return res.status(500).json({ message: "DB error" });

    res.json(rows);
  });
});

/* ==========================
   GET USER BY ID (ADMIN)
========================== */
router.get("/:id", auth, adminOnly, (req, res) => {
  db.get(
    `SELECT id, username, role, password,data_added FROM users WHERE id = ?`,
    [req.params.id],
    (err, user) => {
      if (!user)
        return res.status(404).json({ message: "User tidak ditemukan" });

      res.json(user);
    }
  );
});

module.exports = router;
