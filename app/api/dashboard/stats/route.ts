import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import Employee from "@/lib/db/models/Employee"
import Attendance from "@/lib/db/models/Attendance"
import Expense from "@/lib/db/models/Expense"

export async function GET() {
  try {
    await connectToDatabase()

    // Get employee count
    const employeeCount = await Employee.countDocuments()

    // Get today's attendance count
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const attendanceCount = await Attendance.countDocuments({
      date: {
        $gte: today,
        $lt: tomorrow,
      },
      status: "present",
    })

    // Get total expenses
    const expenses = await Expense.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ])

    const totalExpenses = expenses.length > 0 ? expenses[0].total : 0

    return NextResponse.json({
      employees: employeeCount,
      attendance: attendanceCount,
      expenses: totalExpenses,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
