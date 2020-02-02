import httpStatus = require("http-status-codes");
import app = require("../src/app");
import request = require("supertest");

describe("app.js", () => {
    it("登録画面に username, password の入力フォームが存在する", async () => {
        const response = await request(app).get("/register");
        expect(response.statusCode).toBe(httpStatus.OK);
        expect(response.text).toContain("username1:");
        expect(response.text).toContain("userid:");
        expect(response.text).toContain("username2:");
    });
});
