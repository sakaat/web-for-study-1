import httpStatus = require("http-status-codes");
import app = require("../src/app");
import request = require("supertest");

describe("app.js", () => {
    it("ログイン画面に username, password の入力フォームが存在する", async () => {
        const response = await request(app).get("/login");
        expect(response.statusCode).toBe(httpStatus.OK);
        expect(response.text).toContain("username:");
        expect(response.text).toContain("password:");
    });
});
