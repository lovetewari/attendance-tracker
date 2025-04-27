import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export type Employee = {
  id: number
  name: string
  position: string
  email: string
  phone: string
  created_at?: string
}

export type AttendanceRecord = {
  id?: number
  employee_id: number
  date: string
  present: boolean
  created_at?: string
}

export type Expense = {
  id?: string
  employee_id: number
  date: string
  amount: number
  description: string
  category: string
  created_at?: string
}
