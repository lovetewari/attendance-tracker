// Run this script to test MongoDB connection
// Usage: node scripts/test-db-connection.js

const mongoose = require("mongoose")

// Use the same connection string as in your application
const MONGODB_URI =
  "mongodb+srv://noticetheater0f:58kI1oVlhZ2BzoBB@cluster0.2r7xehy.mongodb.net/nm_decor?retryWrites=true&w=majority&appName=Cluster0"

async function testConnection() {
  try {
    console.log("Attempting to connect to MongoDB...")
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    })

    console.log("Connected to MongoDB successfully!")
    console.log("Connection details:", mongoose.connection.host)

    // List available databases
    const admin = mongoose.connection.db.admin()
    const result = await admin.listDatabases()
    console.log("Available databases:")
    result.databases.forEach((db) => {
      console.log(`- ${db.name}`)
    })

    await mongoose.disconnect()
    console.log("Disconnected from MongoDB.")
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
  }
}

testConnection()
