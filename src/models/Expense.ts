import mongoose from "mongoose"

export interface IExpense {
  employeeId: mongoose.Types.ObjectId
  date: Date
  amount: number
  description: string
  category: string
  createdAt: Date
}

export interface IExpenseDocument extends IExpense, mongoose.Document {}

const expenseSchema = new mongoose.Schema<IExpenseDocument>(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

const Expense = mongoose.model<IExpenseDocument>("Expense", expenseSchema)

export default Expense
