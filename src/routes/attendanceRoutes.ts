import express from "express"
import {
  getAllAttendance,
  getAttendanceByDate,
  getAttendanceByDateRange,
  getAttendanceByEmployee,
  markAttendance,
} from "../controllers/attendanceController"
import { authenticateToken } from "../middleware/auth"

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Routes
router.get("/", getAllAttendance)
router.get("/date/:date", getAttendanceByDate)
router.get("/range", getAttendanceByDateRange)
router.get("/employee/:employeeId", getAttendanceByEmployee)
router.post("/mark", markAttendance)

export default router
