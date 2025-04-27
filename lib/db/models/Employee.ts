import mongoose from "mongoose"

// Define the Employee schema
const EmployeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide employee name"],
      trim: true,
    },
    position: {
      type: String,
      required: [true, "Please provide employee position"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide employee email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Please provide employee phone number"],
      trim: true,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "on-leave"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
)

// Create and export the Employee model
export default mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema)
