"use server"

import { promises as fs } from "fs"
import path from "path"

// Define data types
export type Employee = {
  id: number
  name: string
  position: string
  email: string
  phone: string
}

export type AttendanceRecord = {
  date: string
  employeeId: number
  present: boolean
}

export type Expense = {
  id: string
  employeeId: number
  date: string
  amount: number
  description: string
  category: string
}

// Define database structure
type Database = {
  employees: Employee[]
  attendance: AttendanceRecord[]
  expenses: Expense[]
}

// Initial data
const initialData: Database = {
  employees: [
    { id: 1, name: "John Doe", position: "Designer", email: "john@nmdecor.com", phone: "555-1234" },
    { id: 2, name: "Jane Smith", position: "Carpenter", email: "jane@nmdecor.com", phone: "555-2345" },
    { id: 3, name: "Michael Johnson", position: "Painter", email: "michael@nmdecor.com", phone: "555-3456" },
    { id: 4, name: "Emily Davis", position: "Interior Designer", email: "emily@nmdecor.com", phone: "555-4567" },
    { id: 5, name: "Robert Wilson", position: "Electrician", email: "robert@nmdecor.com", phone: "555-5678" },
    { id: 6, name: "Sarah Brown", position: "Plumber", email: "sarah@nmdecor.com", phone: "555-6789" },
    { id: 7, name: "David Miller", position: "Architect", email: "david@nmdecor.com", phone: "555-7890" },
    { id: 8, name: "Jennifer Taylor", position: "Project Manager", email: "jennifer@nmdecor.com", phone: "555-8901" },
    { id: 9, name: "William Anderson", position: "Supervisor", email: "william@nmdecor.com", phone: "555-9012" },
    { id: 10, name: "Lisa Thomas", position: "Assistant", email: "lisa@nmdecor.com", phone: "555-0123" },
  ],
  attendance: [],
  expenses: [],
}

// File path for database
const dbFilePath = path.join(process.cwd(), "db.json")

// Initialize database if it doesn't exist
async function initializeDb() {
  try {
    await fs.access(dbFilePath)
  } catch (error) {
    // File doesn't exist, create it with initial data
    await fs.writeFile(dbFilePath, JSON.stringify(initialData, null, 2))
  }
}

// Get database
async function getDb(): Promise<Database> {
  await initializeDb()
  const data = await fs.readFile(dbFilePath, "utf8")
  return JSON.parse(data)
}

// Save database
async function saveDb(db: Database) {
  await fs.writeFile(dbFilePath, JSON.stringify(db, null, 2))
}

// Employee operations
export async function getEmployees(): Promise<Employee[]> {
  const db = await getDb()
  return db.employees
}

export async function addEmployee(employee: Omit<Employee, "id">): Promise<Employee> {
  const db = await getDb()
  const newId = db.employees.length > 0 ? Math.max(...db.employees.map((e) => e.id)) + 1 : 1
  const newEmployee = { id: newId, ...employee }

  db.employees.push(newEmployee)
  await saveDb(db)

  return newEmployee
}

export async function updateEmployee(employee: Employee): Promise<Employee> {
  const db = await getDb()
  const index = db.employees.findIndex((e) => e.id === employee.id)

  if (index === -1) {
    throw new Error(`Employee with ID ${employee.id} not found`)
  }

  db.employees[index] = employee
  await saveDb(db)

  return employee
}

export async function deleteEmployee(id: number): Promise<void> {
  const db = await getDb()
  db.employees = db.employees.filter((e) => e.id !== id)
  await saveDb(db)
}

// Attendance operations
export async function getAttendance(): Promise<AttendanceRecord[]> {
  const db = await getDb()
  return db.attendance
}

export async function getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
  const db = await getDb()
  return db.attendance.filter((record) => record.date === date)
}

export async function markAttendance(record: AttendanceRecord): Promise<AttendanceRecord> {
  const db = await getDb()

  // Remove existing record for this employee and date if it exists
  db.attendance = db.attendance.filter((r) => !(r.date === record.date && r.employeeId === record.employeeId))

  // Add new record
  db.attendance.push(record)
  await saveDb(db)

  return record
}

// Expense operations
export async function getExpenses(): Promise<Expense[]> {
  const db = await getDb()
  return db.expenses
}

export async function getExpensesByDate(date: string): Promise<Expense[]> {
  const db = await getDb()
  return db.expenses.filter((expense) => expense.date === date)
}

export async function addExpense(expense: Omit<Expense, "id">): Promise<Expense> {
  const db = await getDb()
  const newExpense = { id: Date.now().toString(), ...expense }

  db.expenses.push(newExpense)
  await saveDb(db)

  return newExpense
}

export async function deleteExpense(id: string): Promise<void> {
  const db = await getDb()
  db.expenses = db.expenses.filter((e) => e.id !== id)
  await saveDb(db)
}
