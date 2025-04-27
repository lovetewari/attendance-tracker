import mongoose from "mongoose"

export interface IEmployee {
  name: string
  position: string
  email?: string
  phone?: string
  createdAt: Date
}

export interface IEmployeeDocument extends IEmployee, mongoose.Document {}

const employeeSchema = new mongoose.Schema<IEmployeeDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
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

const Employee = mongoose.model<IEmployeeDocument>("Employee", employeeSchema)

export default Employee
