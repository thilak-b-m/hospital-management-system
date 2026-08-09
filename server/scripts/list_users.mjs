import mongoose from 'mongoose';
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
  const users = await User.find().select('-password');
  console.log('Users:', users);
  await mongoose.disconnect();
};

run().catch(err => { console.error(err); process.exit(1); });
