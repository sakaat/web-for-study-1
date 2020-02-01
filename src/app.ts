import express = require("express");
const app = express();
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

import bcrypt = require("bcrypt");

app.get("/", (_req, res) => res.send("Hello World!"));

app.get("/login", (_req, res) => res.render("./login.ejs"));

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
        res.render("./");
    } else {
        console.log("失敗");
        res.render("./login.ejs");
    }
});

module.exports = app;
