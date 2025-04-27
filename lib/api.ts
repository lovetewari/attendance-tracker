// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

// Helper function to fetch employees with error handling
export async function getEmployees() {
  try {
    const res = await fetch(`${API_URL}/api/employees`, {
      cache: "no-store",
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      throw new Error("Failed to fetch employees")
    }

    const employees = await res.json()
    return { employees, error: null }
  } catch (error) {
    console.error("Error fetching employees:", error)
    return { employees: [], error: "Failed to load employees" }
  }
}

const employeeApi = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/employees`, { cache: "no-store" })
    if (!res.ok) throw new Error("Failed to fetch employees")
    return res.json()
  },
  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/api/employees/${id}`, { cache: "no-store" })
    if (!res.ok) throw new Error(`Failed to fetch employee with id ${id}`)
    return res.json()
  },
  create: async (data: any) => {
    const res = await fetch(`${API_URL}/api/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to create employee")
    return res.json()
  },
  update: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/api/employees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`Failed to update employee with id ${id}`)
    return res.json()
  },
  delete: async (id: string) => {
    const res = await fetch(`${API_URL}/api/employees/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error(`Failed to delete employee with id ${id}`)
  },
}

const attendanceApi = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/attendance`, { cache: "no-store" })
    if (!res.ok) throw new Error("Failed to fetch attendance")
    return res.json()
  },
  getByDate: async (date: string) => {
    const res = await fetch(`${API_URL}/api/attendance/date/${date}`, { cache: "no-store" })
    if (!res.ok) throw new Error(`Failed to fetch attendance for date ${date}`)
    return res.json()
  },
  mark: async (data: any) => {
    console.log("Sending attendance data to API:", data)
    const res = await fetch(`${API_URL}/api/attendance/mark`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: "Unknown error" }))
      console.error("Attendance marking failed:", errorData)
      throw new Error(errorData.error || "Failed to mark attendance")
    }

    return res.json()
  },
}

const expenseApi = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/expenses`, { cache: "no-store" })
    if (!res.ok) throw new Error("Failed to fetch expenses")
    return res.json()
  },
  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/api/expenses/${id}`, { cache: "no-store" })
    if (!res.ok) throw new Error(`Failed to fetch expense with id ${id}`)
    return res.json()
  },
  getByDate: async (date: string) => {
    try {
      console.log(`Fetching expenses for date: ${date}`)
      const response = await fetch(`${API_URL}/api/expenses/date/${date}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch expenses: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Error in expenseApi.getByDate:", error)
      throw error
    }
  },
  create: async (data: any) => {
    const res = await fetch(`${API_URL}/api/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to create expense")
    return res.json()
  },
  update: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/api/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`Failed to update expense with id ${id}`)
    return res.json()
  },
  delete: async (id: string) => {
    console.log(`Deleting expense with ID: ${id}`)
    const res = await fetch(`${API_URL}/api/expenses/${id}`, { method: "DELETE" })

    if (!res.ok) {
      // Try to get the error message from the response
      const errorData = await res.json().catch(() => ({ error: "Unknown error" }))
      console.error("Expense deletion failed:", errorData)
      throw new Error(errorData.error || `Failed to delete expense with id ${id}`)
    }

    return res.json()
  },
}

export { employeeApi, attendanceApi, expenseApi }
