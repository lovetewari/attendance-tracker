import mongoose from "mongoose"
import bcrypt from "bcrypt"
import dotenv from "dotenv"
import User from "../models/User"
import Employee from "../models/Employee"

// Load environment variables
dotenv.config()

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/nm_decor")
    console.log("MongoDB Connected")
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`)
    process.exit(1)
  }
}

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({})
    await Employee.deleteMany({})

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10)
    await User.create({
      username: "admin",
      password: hashedPassword,
      email: "admin@nmdecor.com",
      name: "Admin User",
    })

    // Create employees
    const employees = [
      { name: "John Doe", position: "Designer", email: "john@nmdecor.com", phone: "555-1234" },
      { name: "Jane Smith", position: "Carpenter", email: "jane@nmdecor.com", phone: "555-2345" },
      { name: "Mike Johnson", position: "Painter", email: "mike@nmdecor.com", phone: "555-3456" },
      { name: "Sarah Williams", position: "Interior Designer", email: "sarah@nmdecor.com", phone: "555-4567" },
      { name: "David Brown", position: "Electrician", email: "david@nmdecor.com", phone: "555-5678" },
    ]

    await Employee.insertMany(employees)

    console.log("Data seeded successfully")
    process.exit(0)
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`)
    process.exit(1)
  }
}

// Run the seed function
connectDB().then(() => {
  seedData()
})
