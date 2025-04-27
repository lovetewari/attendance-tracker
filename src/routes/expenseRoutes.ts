import express from "express"
import {
  getAllExpenses,
  getExpenseById,
  getExpensesByDate,
  getExpensesByDateRange,
  getExpensesByEmployee,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController"
import { authenticateToken } from "../middleware/auth"

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Routes
router.get("/", getAllExpenses)
router.get("/:id", getExpenseById)
router.get("/date/:date", getExpensesByDate)
router.get("/range", getExpensesByDateRange)
router.get("/employee/:employeeId", getExpensesByEmployee)
router.post("/", createExpense)
router.put("/:id", updateExpense)
router.delete("/:id", deleteExpense)

export default router
