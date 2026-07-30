import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./src/models/user.js";

await mongoose.connect(process.env.MONGO_URI);

const existing = await User.findOne({ email: "admin@citycare.com" });
if (existing) {
  console.log("Admin already exists:", existing.email);
} else {
  const hashed = await bcrypt.hash("Admin@1234", 10);
  await User.create({
    name: "Admin User",
    email: "admin@citycare.com",
    phone: "9000000000",
    password: hashed,
    role: "admin",
    status: "Active",
  });
  console.log("Admin created: admin@citycare.com / Admin@1234");
}

await mongoose.disconnect();
process.exit(0);
