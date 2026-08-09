import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import User from '../src/models/user.js';

const run = async () => {
  let mongoUri = 'mongodb://127.0.0.1:27017/hms';
  try {
    const env = fs.readFileSync(path.resolve('.env'), 'utf8');
    const m = env.match(/MONGO_URI\s*=\s*(.*)/);
    if (m) mongoUri = m[1].trim();
  } catch {}

  await mongoose.connect(mongoUri);
  const user = await User.findOne({ email: 'doctor@citycare.com' });
  if (!user) { console.error('Doctor user not found'); process.exit(1); }
  user.password = await bcrypt.hash('Doctor@1234', 10);
  await user.save();
  console.log('Doctor password reset to Doctor@1234');
  await mongoose.disconnect();
};

run().catch(err => { console.error(err); process.exit(1); });
