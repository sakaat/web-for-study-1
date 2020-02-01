import httpStatus = require("http-status-codes");
import app = require("../src/app");
import request = require("supertest");

describe("index.js", () => {
    it("should return a OK response.", async () => {
        const response = await request(app).get("/");
        expect(response.statusCode).toBe(httpStatus.OK);
        expect(response.text).toBe("Hello World!");
    });
});
