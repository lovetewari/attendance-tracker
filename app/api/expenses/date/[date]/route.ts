import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import Expense from "@/lib/db/models/Expense"

export async function GET(request: Request, { params }: { params: { date: string } }) {
  try {
    const date = params.date
    console.log("Fetching expenses for date:", date)

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }

    await connectToDatabase()

    // Create start and end of day for the given date in UTC
    // This ensures we capture all expenses for the day regardless of time
    const startDate = new Date(date)
    startDate.setUTCHours(0, 0, 0, 0)

    const endDate = new Date(date)
    endDate.setUTCHours(23, 59, 59, 999)

    console.log(`Looking for expenses between ${startDate.toISOString()} and ${endDate.toISOString()}`)

    // Find expenses for the specified date range
    const expenses = await Expense.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).populate("employeeId", "name position")

    // Also try to find expenses with the exact date string match
    // This handles cases where the date might be stored as a string
    const stringDateExpenses = await Expense.find({
      date: date,
    }).populate("employeeId", "name position")

    // Combine both result sets and remove duplicates
    const allExpenses = [...expenses, ...stringDateExpenses]

    // Remove duplicates by ID
    const uniqueExpenses = allExpenses.filter(
      (expense, index, self) => index === self.findIndex((e) => e._id.toString() === expense._id.toString()),
    )

    console.log(`Found ${uniqueExpenses.length} expenses for date ${date}`)

    // Transform the records to a more frontend-friendly format
    const formattedExpenses = uniqueExpenses.map((expense) => {
      // Create a base object with safe access to properties
      const result: any = {
        _id: expense._id ? expense._id.toString() : "",
        id: expense._id ? expense._id.toString() : "",
        date: expense.date,
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        createdAt: expense.createdAt,
      }

      // Safely add employee information if it exists
      if (expense.employeeId) {
        // Handle both object and string IDs
        if (typeof expense.employeeId === "object") {
          result.employeeId = expense.employeeId._id ? expense.employeeId._id.toString() : ""
          result.employeeName = expense.employeeId.name || "Staff Member"
          result.employeePosition = expense.employeeId.position || ""
        } else {
          // If employeeId is just a string ID
          result.employeeId = expense.employeeId.toString()
          result.employeeName = "Staff Member"
          result.employeePosition = ""
        }
      } else {
        // Fallback for missing employee reference
        result.employeeId = ""
        result.employeeName = "Staff Member"
        result.employeePosition = ""
      }

      return result
    })

    return NextResponse.json(formattedExpenses)
  } catch (error) {
    console.error("Error fetching expenses by date:", error)
    return NextResponse.json({ error: "Failed to fetch expense records" }, { status: 500 })
  }
}
