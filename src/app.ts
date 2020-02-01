import express = require("express");
const app = express();

app.get("/", (_req, res) => res.send("Hello World!"));

app.get("/login", (_req, res) => res.render("./login.ejs"));
app.post("/login", (_req, res) => res.send("login"));

module.exports = app;
