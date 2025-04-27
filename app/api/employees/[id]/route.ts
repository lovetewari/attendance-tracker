import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import Employee from "@/lib/db/models/Employee"

export async function GET(request: Request, { params }: { params: { id: string | Promise<string> } }) {
  try {
    const id = await params.id
    await connectToDatabase()

    const employee = await Employee.findById(id)
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error("Error fetching employee:", error)
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string | Promise<string> } }) {
  try {
    const id = await params.id
    const body = await request.json()
    await connectToDatabase()

    const updatedEmployee = await Employee.findByIdAndUpdate(id, body, { new: true })
    if (!updatedEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json(updatedEmployee)
  } catch (error) {
    console.error("Error updating employee:", error)
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string | Promise<string> } }) {
  try {
    const id = await params.id
    await connectToDatabase()

    const deletedEmployee = await Employee.findByIdAndDelete(id)
    if (!deletedEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting employee:", error)
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 })
  }
}
