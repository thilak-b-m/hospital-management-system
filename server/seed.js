import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./src/models/user.js";

const adminEmail = (process.env.ADMIN_EMAIL || "admin@citycare.com").trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || "CityCareAdmin#2026!";

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not set. Add it to server/.env before seeding.");
  process.exitCode = 1;
} else if (adminPassword.length < 8 || Buffer.byteLength(adminPassword, "utf8") > 72) {
  console.error("ADMIN_PASSWORD must be 8-72 characters.");
  process.exitCode = 1;
} else {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({ email: adminEmail });
    if (existing && existing.role !== "admin") {
      throw new Error(`The email ${adminEmail} is already assigned to a non-admin account.`);
    }

    if (existing) {
      console.log("Admin already exists:", existing.email);
    } else {
      const hashed = await bcrypt.hash(adminPassword, 12);
      await User.create({
        name: "CityCare Administrator",
        email: adminEmail,
        phone: "9000000000",
        password: hashed,
        role: "admin",
        status: "Active",
      });
      console.log(`Admin created: ${adminEmail}`);
    }
  } catch (error) {
    console.error("Admin seeding failed:", error.message);
    console.error("Check MongoDB credentials, network access, and Atlas IP access list.");
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}
