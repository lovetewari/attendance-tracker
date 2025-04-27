import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import Expense from "@/lib/db/models/Expense"

export async function GET() {
  try {
    await connectToDatabase()
    const expenses = await Expense.find().sort({ date: -1 })
    return NextResponse.json(expenses)
  } catch (error) {
    console.error("Error fetching expenses:", error)
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { employeeId, date, amount, description, category } = body

    console.log("Creating expense with data:", { employeeId, date, amount, description, category })

    if (!employeeId || !date || !amount) {
      return NextResponse.json({ error: "Employee ID, date, and amount are required" }, { status: 400 })
    }

    await connectToDatabase()

    // Create the expense without type conversion
    const newExpense = new Expense({
      employeeId, // Use the employeeId as-is without conversion
      date,
      amount: Number(amount), // Ensure amount is a number
      description,
      category,
    })

    console.log("New expense object:", newExpense)

    const savedExpense = await newExpense.save()
    console.log("Expense saved successfully:", savedExpense)

    return NextResponse.json(savedExpense)
  } catch (error) {
    console.error("Error creating expense:", error)
    return NextResponse.json(
      { error: "Failed to create expense", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
