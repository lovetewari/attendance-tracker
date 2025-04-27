"use server"

import { getAttendance, getExpenses } from "@/lib/db"

export async function getAttendanceAction() {
  return getAttendance()
}

export async function getExpensesAction() {
  return getExpenses()
}
