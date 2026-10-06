import request from "supertest";
import mongoose from "mongoose";
import app from "../src/server.js";
import User from "../src/models/User.js";

describe("Authentication and RBAC API", () => {

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });


    test("should register a SALES_USER", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                fullName: "Test Sales User",
                email: `test${Date.now()}@example.com`,
                password: "123456",
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.user.role).toBe("SALES_USER");
    });


    test("should reject duplicate sales order for the same quotation", async () => {

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: process.env.TEST_ADMIN_EMAIL,
                password: process.env.TEST_ADMIN_PASSWORD,
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.token;

        const response = await request(app)
            .post("/api/sales-orders")
            .set("Authorization", `Bearer ${token}`)
            .send({
                orderNumber: `SO-TEST-${Date.now()}`,
                quotationId: "6ac4addbe851055379777892",
            });

        expect(response.statusCode).toBe(409);

        expect(response.body.success).toBe(false);

        expect(response.body.message).toBe(
            "A sales order already exists for this quotation"
        );
    });

    test("should reject dispatch for an already dispatched sales order", async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: process.env.TEST_ADMIN_EMAIL,
                password: process.env.TEST_ADMIN_PASSWORD,
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.token;

        const response = await request(app)
            .post("/api/dispatches/6ac4bb89a8a5aa9c492a10ed")
            .set("Authorization", `Bearer ${token}`)
            .send({
                dispatchNumber: `DISP-TEST-${Date.now()}`,
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("should reject access without authentication token", async () => {
        const response = await request(app)
            .get("/api/users");

        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "Authentication required"
        );
    });

    test("should reject inventory update below reserved quantity", async () => {
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: process.env.TEST_ADMIN_EMAIL,
                password: process.env.TEST_ADMIN_PASSWORD,
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.token;

        const response = await request(app)
            .patch("/api/inventory/6ac4a2200e112d3df79bdeb2")
            .set("Authorization", `Bearer ${token}`)
            .send({
                physicalQuantity: -10,
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe(
            "physicalQuantity cannot be negative"
        );
    });

});