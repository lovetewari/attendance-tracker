import type { Request, Response } from "express"
import Employee from "../models/Employee"
import mongoose from "mongoose"

// Get all employees
export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await Employee.find().sort({ name: 1 })
    res.status(200).json(employees)
  } catch (error) {
    res.status(500).json({ message: "Error fetching employees", error: error.message })
  }
}

// Get employee by ID
export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid employee ID" })
    }

    const employee = await Employee.findById(id)

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" })
    }

    res.status(200).json(employee)
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee", error: error.message })
  }
}

// Create a new employee
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { name, position, email, phone } = req.body

    if (!name || !position) {
      return res.status(400).json({ message: "Name and position are required" })
    }

    const newEmployee = new Employee({
      name,
      position,
      email,
      phone,
    })

    const savedEmployee = await newEmployee.save()
    res.status(201).json(savedEmployee)
  } catch (error) {
    res.status(500).json({ message: "Error creating employee", error: error.message })
  }
}

// Update an employee
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, position, email, phone } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid employee ID" })
    }

    if (!name || !position) {
      return res.status(400).json({ message: "Name and position are required" })
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      {
        name,
        position,
        email,
        phone,
      },
      { new: true },
    )

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" })
    }

    res.status(200).json(updatedEmployee)
  } catch (error) {
    res.status(500).json({ message: "Error updating employee", error: error.message })
  }
}

// Delete an employee
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid employee ID" })
    }

    const deletedEmployee = await Employee.findByIdAndDelete(id)

    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found" })
    }

    res.status(200).json({ message: "Employee deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Error deleting employee", error: error.message })
  }
}
