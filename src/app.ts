import express = require("express");
const app = express();
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

import session = require("express-session");

import request = require("request");

import uuidv1 = require("uuid/v1");

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
    const docClient = new AWS.DynamoDB.DocumentClient({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_DEFAULT_REGION,
    });
    const params = {
        TableName: "web-for-study-1-users",
        Key: {
            "username": req.body.username,
        },
    };
    const data = await docClient.get(params).promise();

    if (bcrypt.compareSync(req.body.password, data.Item.password)) {
        if (data.Item.flag === 0) {
            console.log("成功");
            req.session.username = req.body.username;
            res.redirect("/");
        }
        if (data.Item.flag === 1) {
            res.send("初回ログイン");
        }
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

app.post("/register", async (req, res) => {
    const AWS = require("aws-sdk");
    const docClient = new AWS.DynamoDB.DocumentClient({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_DEFAULT_REGION,
    });
    const params = {
        TableName: "web-for-study-1-directory",
        Key: {
            "userid": req.body.userid,
        },
    };
    const data = await docClient.get(params).promise();
    console.log(data);

    if (data.Item.username === req.body.username1) {
        console.log("成功");

        const params2 = {
            TableName: "web-for-study-1-users",
            Item: {
                username: req.body.username1,
                password: "dummy",
                flag: 2,
            },
        };
        await docClient.put(params2, (error) => {
            if (error) {
                throw new Error(
                    `Failed to save data to DynamoDB. ${error.message}`,
                );
            }
        });

        const payload = `payload=
            {
                "text": "Slack Message Sample Text",
                "attachments": [
                    {
                        "fallback": "fallback string",
                        "title": "${req.body.username1} が ${req.body.username2} に承認を求めています",
                        "callback_id": "callback_id value",
                        "color": "#FF0000",
                        "attachment_type": "default",
                        "actions": [
                            {
                                "name": "btn1Name",
                                "text": "APPROVE",
                                "type": "button",
                                "style": "default",
                                "value": "approve ${req.body.username1}"
                            },
                            {
                                "name": "btn2Name",
                                "text": "REJECT",
                                "type": "button",
                                "style": "default",
                                "value": "reject ${req.body.username1}"
                            }
                        ]
                    }
                ],
                "response_type": "ephemeral",
                "replace_original": true,
                "delete_original": true
            }`;
        const options = {
            url: process.env.SLACK_URL,
            headers: { "cache-control": "no-cache" },
            form: payload,
            json: true,
        };

        request.post(options, (error) => {
            if (error) {
                throw new Error(error);
            }
        });

        res.redirect("/");
    } else {
        console.log("失敗");
        res.render("./login.ejs");
    }
});

app.post("/slack", (req, res) => {
    const payload = JSON.parse(req.body.payload);
    console.log(payload);
    if (payload.actions[0].value.slice(0, 7) === "approve") {
        const AWS = require("aws-sdk");
        const docClient = new AWS.DynamoDB.DocumentClient({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_DEFAULT_REGION,
        });

        const saltRounds = 10;
        const password = uuidv1().slice(0, 8);
        const hash = bcrypt.hashSync(password, saltRounds);

        const params = {
            TableName: "web-for-study-1-users",
            Key: {
                username: payload.actions[0].value.slice(8),
            },
            UpdateExpression: "set password = :password, flag = :flag",
            ExpressionAttributeValues: {
                ":password": hash,
                ":flag": 1,
            },
            ReturnValues: "ALL_NEW",
        };
        docClient.update(params, (error) => {
            if (error) {
                throw new Error(error);
            }
        });
        res.send(`APPROVED - ${password}`);
    } else {
        res.send("REJECTED");
    }
});

module.exports = app;
