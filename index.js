const express = require("express");
const app = express();

const authRoutes = require("./auth");
const userRoutes = require("./users");

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

app.listen(3000, () => {
  console.log("Server jalan di http://localhost:3000");
});