import express from "express"
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController"
import { authenticateToken } from "../middleware/auth"

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Routes
router.get("/", getAllEmployees)
router.get("/:id", getEmployeeById)
router.post("/", createEmployee)
router.put("/:id", updateEmployee)
router.delete("/:id", deleteEmployee)

export default router
