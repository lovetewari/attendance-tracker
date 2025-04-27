import type { Request, Response } from "express"
import Attendance from "../models/Attendance"
import Employee from "../models/Employee"
import mongoose from "mongoose"

// Get all attendance records
export const getAllAttendance = async (req: Request, res: Response) => {
  try {
    const attendance = await Attendance.find().populate("employeeId", "name position").sort({ date: -1 })

    res.status(200).json(attendance)
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance records", error: error.message })
  }
}

// Get attendance by date
export const getAttendanceByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.params

    // Create a date range for the entire day
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)

    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
    }).populate("employeeId", "name position")

    res.status(200).json(attendance)
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance by date", error: error.message })
  }
}

// Get attendance by date range
export const getAttendanceByDateRange = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" })
    }

    const start = new Date(startDate as string)
    start.setHours(0, 0, 0, 0)

    const end = new Date(endDate as string)
    end.setHours(23, 59, 59, 999)

    const attendance = await Attendance.find({
      date: { $gte: start, $lte: end },
    })
      .populate("employeeId", "name position")
      .sort({ date: -1 })

    res.status(200).json(attendance)
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance by date range", error: error.message })
  }
}

// Get attendance by employee
export const getAttendanceByEmployee = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID" })
    }

    const attendance = await Attendance.find({ employeeId }).populate("employeeId", "name position").sort({ date: -1 })

    res.status(200).json(attendance)
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance by employee", error: error.message })
  }
}

// Mark attendance
export const markAttendance = async (req: Request, res: Response) => {
  try {
    const { employeeId, date, present } = req.body

    if (!employeeId || !date || present === undefined) {
      return res.status(400).json({ message: "Employee ID, date, and present status are required" })
    }

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID" })
    }

    // Check if employee exists
    const employee = await Employee.findById(employeeId)
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" })
    }

    const attendanceDate = new Date(date)

    // Check if attendance record already exists for this employee and date
    const existingAttendance = await Attendance.findOne({
      employeeId,
      date: {
        $gte: new Date(attendanceDate.setHours(0, 0, 0, 0)),
        $lte: new Date(attendanceDate.setHours(23, 59, 59, 999)),
      },
    })

    if (existingAttendance) {
      // Update existing record
      existingAttendance.present = present
      const updatedAttendance = await existingAttendance.save()

      return res.status(200).json(updatedAttendance)
    }

    // Create new attendance record
    const newAttendance = new Attendance({
      employeeId,
      date: new Date(date),
      present,
    })

    const savedAttendance = await newAttendance.save()
    res.status(201).json(savedAttendance)
  } catch (error) {
    res.status(500).json({ message: "Error marking attendance", error: error.message })
  }
}
