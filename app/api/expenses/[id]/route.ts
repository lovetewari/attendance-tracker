import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db/connect"
import Expense from "@/lib/db/models/Expense"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log("Fetching expense with ID:", id)

    if (!id) {
      return NextResponse.json({ error: "Expense ID is required" }, { status: 400 })
    }

    await connectToDatabase()

    const expense = await Expense.findById(id)
    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    return NextResponse.json(expense)
  } catch (error) {
    console.error("Error fetching expense:", error)
    return NextResponse.json({ error: "Failed to fetch expense" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Expense ID is required" }, { status: 400 })
    }

    await connectToDatabase()

    const updatedExpense = await Expense.findByIdAndUpdate(id, body, { new: true })
    if (!updatedExpense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    return NextResponse.json(updatedExpense)
  } catch (error) {
    console.error("Error updating expense:", error)
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log("Deleting expense with ID:", id)

    if (!id) {
      return NextResponse.json({ error: "Expense ID is required" }, { status: 400 })
    }

    await connectToDatabase()

    const deletedExpense = await Expense.findByIdAndDelete(id)
    if (!deletedExpense) {
      console.log("Expense not found with ID:", id)
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    console.log("Successfully deleted expense:", id)
    return NextResponse.json({ success: true, message: "Expense deleted successfully" })
  } catch (error) {
    console.error("Error deleting expense:", error)
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 })
  }
}
