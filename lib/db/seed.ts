import dbConnect from "./connect"
import User from "./models/User"
import Employee from "./models/Employee"

export async function seedDatabase() {
  await dbConnect()

  // Check if admin user exists
  const adminExists = await User.findOne({ username: "admin" })
  if (!adminExists) {
    console.log("Creating admin user...")
    await User.create({
      username: "admin",
      password: "admin123", // This will be hashed by the pre-save hook
      name: "Administrator",
      email: "admin@nmdecor.com",
    })
  }

  // Check if there are any employees
  const employeeCount = await Employee.countDocuments()
  if (employeeCount === 0) {
    console.log("Creating sample employees...")
    await Employee.insertMany([
      {
        name: "John Doe",
        position: "Manager",
        email: "john@nmdecor.com",
        phone: "123-456-7890",
      },
      {
        name: "Jane Smith",
        position: "Designer",
        email: "jane@nmdecor.com",
        phone: "123-456-7891",
      },
      {
        name: "Bob Johnson",
        position: "Carpenter",
        email: "bob@nmdecor.com",
        phone: "123-456-7892",
      },
      {
        name: "Alice Williams",
        position: "Painter",
        email: "alice@nmdecor.com",
        phone: "123-456-7893",
      },
      {
        name: "Charlie Brown",
        position: "Electrician",
        email: "charlie@nmdecor.com",
        phone: "123-456-7894",
      },
    ])
  }

  console.log("Database seeding completed")
}
