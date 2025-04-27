export interface Employee {
  _id: string
  name: string
  position: string
  email?: string
  phone?: string
  createdAt: string
}

export interface AttendanceRecord {
  _id: string
  employeeId: string | Employee
  date: string
  present: boolean
  createdAt: string
}

export interface Expense {
  _id: string
  employeeId: string | Employee
  date: string
  amount: number
  description: string
  category: string
  createdAt: string
}

export interface User {
  _id: string
  username: string
  email?: string
  name?: string
}
