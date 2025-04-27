import type { Request, Response } from "express"
import Expense from "../models/Expense"
import Employee from "../models/Employee"
import mongoose from "mongoose"

// Get all expenses
export const getAllExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await Expense.find().populate("employeeId", "name position").sort({ date: -1 })

    res.status(200).json(expenses)
  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses", error: error.message })
  }
}

// Get expense by ID
export const getExpenseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid expense ID" })
    }

    const expense = await Expense.findById(id).populate("employeeId", "name position")

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" })
    }

    res.status(200).json(expense)
  } catch (error) {
    res.status(500).json({ message: "Error fetching expense", error: error.message })
  }
}

// Get expenses by date
export const getExpensesByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.params

    // Create a date range for the entire day
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)

    const expenses = await Expense.find({
      date: { $gte: startDate, $lte: endDate },
    }).populate("employeeId", "name position")

    res.status(200).json(expenses)
  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses by date", error: error.message })
  }
}

// Get expenses by date range
export const getExpensesByDateRange = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" })
    }

    const start = new Date(startDate as string)
    start.setHours(0, 0, 0, 0)

    const end = new Date(endDate as string)
    end.setHours(23, 59, 59, 999)

    const expenses = await Expense.find({
      date: { $gte: start, $lte: end },
    })
      .populate("employeeId", "name position")
      .sort({ date: -1 })

    res.status(200).json(expenses)
  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses by date range", error: error.message })
  }
}

// Get expenses by employee
export const getExpensesByEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID" })
    }

    const expenses = await Expense.find({ employeeId }).populate("employeeId", "name position").sort({ date: -1 })

    res.status(200).json(expenses)
  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses by employee", error: error.message })
  }
}

// Create a new expense
export const createExpense = async (req: Request, res: Response) => {
  try {
    const { employeeId, date, amount, description, category } = req.body

    if (!employeeId || !date || !amount || !description || !category) {
      return res.status(400).json({
        message: "Employee ID, date, amount, description, and category are required",
      })
    }

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID" })
    }

    // Check if employee exists
    const employee = await Employee.findById(employeeId)
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" })
    }

    const newExpense = new Expense({
      employeeId,
      date: new Date(date),
      amount,
      description,
      category,
    })

    const savedExpense = await newExpense.save()
    res.status(201).json(savedExpense)
  } catch (error) {
    res.status(500).json({ message: "Error creating expense", error: error.message })
  }
}

// Update an expense
export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { employeeId, date, amount, description, category } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid expense ID" })
    }

    if (!employeeId || !date || !amount || !description || !category) {
      return res.status(400).json({
        message: "Employee ID, date, amount, description, and category are required",
      })
    }

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID" })
    }

    // Check if employee exists
    const employee = await Employee.findById(employeeId)
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" })
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      {
        employeeId,
        date: new Date(date),
        amount,
        description,
        category,
      },
      { new: true },
    )

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" })
    }

    res.status(200).json(updatedExpense)
  } catch (error) {
    res.status(500).json({ message: "Error updating expense", error: error.message })
  }
}

// Delete an expense
export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid expense ID" })
    }

    const deletedExpense = await Expense.findByIdAndDelete(id)

    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found" })
    }

    res.status(200).json({ message: "Expense deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Error deleting expense", error: error.message })
  }
}
