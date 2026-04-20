const mongoose = require('mongoose');

// Fallback to a local MongoDB instance if MONGO_URI is missing (for local dev testing)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/investshield';

let isConnected = false;

// 1. Connect to MongoDB
async function getDBConnection() {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log("✅ MongoDB connected successfully.");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

// 2. Define User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// 3. Define Portfolio History Schema
const portfolioHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  total_value: { type: Number },
  health_score: { type: Number },
  payload_json: { type: String, required: true } // JSON stringified data
});

const PortfolioHistory = mongoose.models.PortfolioHistory || mongoose.model('PortfolioHistory', portfolioHistorySchema);

// 4. Initialize Database
async function initDB() {
  await getDBConnection();
  return { User, PortfolioHistory };
}

module.exports = {
  getDBConnection,
  initDB,
  User,
  PortfolioHistory
};
