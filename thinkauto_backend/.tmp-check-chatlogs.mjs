import dotenv from 'dotenv';
import connectDB from './config/database.js';
import ChatLog from './models/ChatLog.js';

dotenv.config();
await connectDB();
const count = await ChatLog.countDocuments();
const latest = await ChatLog.find().sort({ createdAt: -1 }).limit(3).lean();
console.log(JSON.stringify({ count, latest }, null, 2));
process.exit(0);
