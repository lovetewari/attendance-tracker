import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import User from "@/lib/db/models/User"
import bcrypt from "bcryptjs" // Changed from 'bcrypt' to 'bcryptjs'

export async function GET() {
  try {
    await connectToDatabase()

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: "admin" })

    if (existingAdmin) {
      return NextResponse.json({ message: "Seed data already exists" })
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10)

    const adminUser = new User({
      username: "admin",
      password: hashedPassword,
      role: "admin",
    })

    await adminUser.save()

    return NextResponse.json({ message: "Database seeded successfully" })
  } catch (error) {
    console.error("Seeding error:", error)
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 })
  }
}
