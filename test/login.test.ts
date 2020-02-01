import httpStatus = require("http-status-codes");
import app = require("../src/app");
import request = require("supertest");

describe("index.js", () => {
    it("ログイン画面に name, password の入力フォームが存在する", async () => {
        const response = await request(app).get("/login");
        expect(response.statusCode).toBe(httpStatus.OK);
        expect(response.text).toContain("name:");
        expect(response.text).toContain("password:");
    });

    it("ログイン画面で POST すると情報が返ってくる", async () => {
        const response = await request(app).post("/login");
        expect(response.statusCode).toBe(httpStatus.OK);
        expect(response.text).toBe("login");
    });
});
