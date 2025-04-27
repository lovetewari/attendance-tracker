import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import Attendance from "@/lib/db/models/Attendance"

export async function GET(request: Request, { params }: { params: { date: string } }) {
  try {
    // In Next.js 15, we should not await params directly
    const date = params.date
    console.log("Fetching attendance for date:", date)

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }

    await connectToDatabase()

    // Create date range for the entire day
    const startDate = new Date(`${date}T00:00:00.000Z`)
    const endDate = new Date(`${date}T23:59:59.999Z`)

    console.log(`Looking for attendance between ${startDate.toISOString()} and ${endDate.toISOString()}`)

    // Find attendance records for the specified date range
    const attendanceRecords = await Attendance.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).populate("employeeId")

    console.log(`Found ${attendanceRecords.length} attendance records for date ${date}`)

    // Transform records to a more frontend-friendly format
    const formattedRecords = attendanceRecords.map((record) => {
      const result: any = {
        _id: record._id.toString(),
        date: record.date,
        present: record.present,
      }

      // Handle employee data if populated
      if (record.employeeId) {
        if (typeof record.employeeId === "object") {
          result.employeeId = record.employeeId._id ? record.employeeId._id.toString() : null
          result.employeeName = record.employeeId.name || "Unknown"
          result.employeePosition = record.employeeId.position || ""
        } else {
          result.employeeId = record.employeeId.toString()
          result.employeeName = "Unknown"
        }
      }

      return result
    })

    console.log("Returning formatted attendance records:", formattedRecords.length)
    return NextResponse.json(formattedRecords)
  } catch (error) {
    console.error("Error fetching attendance for date:", error)
    return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 })
  }
}
