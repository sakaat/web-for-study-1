import express = require("express");
const app = express();
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

import session = require("express-session");

app.use(
    session({
        secret: "secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 30,
        },
    }),
);

import bcrypt = require("bcrypt");

app.get("/", (req, res) => {
    if (req.session.username) {
        res.send("Hello World!");
    } else {
        res.redirect("/login");
    }
});

app.get("/login", (req, res) => {
    if (req.session.username) {
        return res.redirect("/");
    }
    res.render("./login.ejs");
});

app.post("/login", async (req, res) => {
    const AWS = require("aws-sdk");
    var docClient = new AWS.DynamoDB.DocumentClient({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_DEFAULT_REGION,
    });
    const tableName = "web-for-study-1-users";
    const params = {
        TableName: tableName,
        Key: {
            "username": req.body.username,
        },
    };
    const data = await docClient.get(params).promise();

    if (bcrypt.compareSync(req.body.password, data.Item.password)) {
        console.log("成功");
        req.session.username = req.body.username;
        res.redirect("/");
    } else {
        console.log("失敗");
        res.render("./login.ejs");
    }
});

app.get("/register", async (req, res) => {
    if (req.session.username) {
        return res.redirect("/");
    }
    res.render("./register.ejs");
});

app.post("/register", (_req, res) => {
    res.redirect("/");
});

app.post("/slack", (req, res) => {
    const payload = JSON.parse(req.body.payload);
    console.log(payload);
    if (payload.actions[0].value === "approve") {
        res.send("APPROVED");
    } else {
        res.send("REJECTED");
    }
});

module.exports = app;
