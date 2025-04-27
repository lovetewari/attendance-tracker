import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import Employee from "@/lib/db/models/Employee"

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching all employees")

    // Connect to the database
    await connectToDatabase()

    // Find all employees and sort by name
    const employees = await Employee.find().sort({ name: 1 })
    console.log(`Found ${employees.length} employees`)

    // Return the employees as JSON
    return NextResponse.json(employees)
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log("Creating employee:", data)

    // Connect to the database
    await connectToDatabase()

    // Create a new employee
    const employee = new Employee(data)
    await employee.save()

    console.log("Employee created successfully:", employee)
    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error("Error creating employee:", error)
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}
