import httpStatus = require("http-status-codes");
import app = require("../src/app");
import request = require("supertest");

describe("index.js", () => {
    it("should return a OK response.", async () => {
        const response = await request(app).get("/");
        expect(response.statusCode).toBe(httpStatus.MOVED_TEMPORARILY);
        expect(response.text).toContain("Found. Redirecting to /login");
    });
});
