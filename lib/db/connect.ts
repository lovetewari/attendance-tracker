import mongoose from "mongoose"

// Use the MongoDB Atlas connection string from environment variables
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://noticetheater0f:58kI1oVlhZ2BzoBB@cluster0.2r7xehy.mongodb.net/nm_decor?retryWrites=true&w=majority&appName=Cluster0"

// Add mongoose connection options to handle connection issues
const options = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  family: 4, // Use IPv4, skip trying IPv6
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectToDatabase() {
  if (cached.conn) {
    console.log("Using cached MongoDB connection")
    return cached.conn
  }

  if (!cached.promise) {
    console.log(`Connecting to MongoDB...`)

    cached.promise = mongoose
      .connect(MONGODB_URI, options)
      .then((mongoose) => {
        console.log("Connected to MongoDB successfully")
        return mongoose
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error)
        throw error
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error("MongoDB connection failed:", e)
    throw e
  }

  return cached.conn
}

// For backward compatibility
export default connectToDatabase
