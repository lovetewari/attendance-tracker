import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import Attendance from "@/lib/db/models/Attendance"
import mongoose from "mongoose"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Received attendance data:", body)

    // Handle both field naming conventions for compatibility
    const employeeId = body.employeeId || body.employee_id
    const { date, present } = body

    console.log("Marking attendance:", { employeeId, date, present })

    if (!employeeId || !date) {
      console.error("Missing required fields:", { employeeId, date, present })
      return NextResponse.json({ error: "Employee ID and date are required" }, { status: 400 })
    }

    await connectToDatabase()

    // Convert employeeId to ObjectId if it's a valid ObjectId string
    let employeeObjectId
    try {
      employeeObjectId = new mongoose.Types.ObjectId(employeeId)
    } catch (error) {
      console.error("Invalid ObjectId format:", employeeId)
      return NextResponse.json({ error: "Invalid employee ID format" }, { status: 400 })
    }

    // Format the date to ensure consistency
    const formattedDate = new Date(date)
    if (isNaN(formattedDate.getTime())) {
      console.error("Invalid date format:", date)
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
    }

    // Check if attendance record already exists
    const existingRecord = await Attendance.findOne({
      employeeId: employeeObjectId,
      date: {
        $gte: new Date(formattedDate.setHours(0, 0, 0, 0)),
        $lte: new Date(formattedDate.setHours(23, 59, 59, 999)),
      },
    })

    let result

    if (existingRecord) {
      console.log("Updating existing attendance record:", existingRecord._id)
      // Update existing record
      existingRecord.present = present
      result = await existingRecord.save()
    } else {
      console.log("Creating new attendance record")
      // Create new attendance record
      const newAttendance = new Attendance({
        employeeId: employeeObjectId,
        date: formattedDate,
        present,
      })

      result = await newAttendance.save()
    }

    console.log("Attendance marked successfully:", result)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error marking attendance:", error)
    return NextResponse.json(
      {
        error: "Failed to mark attendance",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
