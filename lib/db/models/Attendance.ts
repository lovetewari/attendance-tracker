import mongoose from "mongoose"

interface IAttendance {
  employeeId: mongoose.Types.ObjectId | string
  date: Date | string
  present: boolean
  createdAt?: Date
}

interface IAttendanceDocument extends IAttendance, mongoose.Document {}

const attendanceSchema = new mongoose.Schema<IAttendanceDocument>(
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
    present: {
      type: Boolean,
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

// Create a compound index for employeeId and date to ensure uniqueness
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true })

// Check if the model already exists to prevent overwriting during hot reloads
const Attendance = mongoose.models.Attendance || mongoose.model<IAttendanceDocument>("Attendance", attendanceSchema)

export default Attendance
