import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import Attendance from "@/lib/db/models/Attendance"

export async function GET() {
  try {
    await connectToDatabase()
    const attendance = await Attendance.find().sort({ date: -1 })
    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
}
