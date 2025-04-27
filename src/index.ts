import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"
import employeeRoutes from "./routes/employeeRoutes"
import attendanceRoutes from "./routes/attendanceRoutes"
import expenseRoutes from "./routes/expenseRoutes"
import authRoutes from "./routes/authRoutes"

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 8080

// MongoDB Connection String
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://noticetheater0f:58kI1oVlhZ2BzoBB@cluster0.2r7xehy.mongodb.net/nm_decor?retryWrites=true&w=majority&appName=Cluster0"

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI)
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`)
    process.exit(1)
  }
}

connectDB()

// Middleware
app.use(express.json())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  }),
)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" })
})

// Routes
app.use("/api/employees", employeeRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/expenses", expenseRoutes)
app.use("/api/auth", authRoutes)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "production" ? "An error occurred" : err.message,
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
