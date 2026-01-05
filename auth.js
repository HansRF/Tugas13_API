const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("./db");
const router = express.Router();

const SECRET_KEY = "rahasia";

/* =====================
   SIGN UP
===================== */
router.post("/signup", (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Data tidak lengkap" });

  const hashed = bcrypt.hashSync(password, 10);

  db.run(
    `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
    [username, hashed, role || "user"],
    function (err) {
      if (err)
        return res.status(400).json({ message: "Username sudah dipakai" });

      res.json({
        message: "Signup berhasil",
        user_id: this.lastID
      });
    }
  );
});

/* =====================
   LOGIN
===================== */
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    `SELECT * FROM users WHERE username = ?`,
    [username],
    (err, user) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (!user) return res.status(401).json({ message: "User tidak ditemukan" });

      const valid = bcrypt.compareSync(password, user.password);
      if (!valid)
        return res.status(401).json({ message: "Password salah" });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        SECRET_KEY,
        { expiresIn: "1h" }
      );

      res.json({ token });
    }
  );
});

module.exports = router;
module.exports.SECRET_KEY = SECRET_KEY;
