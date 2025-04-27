import mongoose from "mongoose"

// Define the schema
const ExpenseSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.Mixed, // Changed from Number to Mixed to accept both string IDs and ObjectIds
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: false,
      default: "Other",
    },
  },
  {
    timestamps: true,
  },
)

// Check if the model already exists to prevent overwriting
const Expense = mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema)

export default Expense
