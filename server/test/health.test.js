import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../src/models/user.js";
import { isPasswordAcceptable } from "../src/utils/passwordPolicy.js";

process.env.JWT_SECRET = "test-only-secret-for-backend-authorization-checks";
const { default: app } = await import("../src/app.js");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server?.listening) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("liveness stays healthy while the process is running", async () => {
  const response = await fetch(`${baseUrl}/health/live`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true, status: "alive" });
});

test("readiness reports unavailable until MongoDB is connected", async () => {
  assert.notEqual(mongoose.connection.readyState, 1);

  const response = await fetch(`${baseUrl}/health/ready`);

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { success: false, status: "not ready" });
});

test("patients cannot access another patient's private records", async () => {
  const ownPatientId = new mongoose.Types.ObjectId().toString();
  const otherPatientId = new mongoose.Types.ObjectId().toString();
  const token = jwt.sign({ id: ownPatientId, role: "patient" }, process.env.JWT_SECRET);
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const requests = [
    ["GET", `/api/medical-history/${otherPatientId}`],
    ["GET", `/api/reports/${otherPatientId}`],
    ["POST", `/api/reports/${otherPatientId}`],
    ["GET", `/api/appointments/patient/${otherPatientId}`],
  ];

  for (const [method, route] of requests) {
    const response = await fetch(`${baseUrl}${route}`, { method, headers });
    assert.equal(response.status, 403, `${method} ${route} should be forbidden`);
  }
});

test("new users default to the least-privileged role", () => {
  assert.equal(User.schema.path("role").defaultValue, "patient");
});

test("password policy enforces length and bcrypt byte limits", () => {
  assert.equal(isPasswordAcceptable("x".repeat(8)), true);
  assert.equal(isPasswordAcceptable("x".repeat(7)), false);
  assert.equal(isPasswordAcceptable("é".repeat(37)), false);
});

test("uploaded reports are not exposed from a public static path", async () => {
  const response = await fetch(`${baseUrl}/uploads/private-report.pdf`);

  assert.equal(response.status, 404);
});

test("login attempts are rate limited", async () => {
  let response;
  for (let attempt = 0; attempt < 11; attempt += 1) {
    response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
  }

  assert.equal(response.status, 429);
});