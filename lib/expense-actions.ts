"use server"

import { revalidatePath } from "next/cache"

export async function getExpensesByDateAction(date: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/expenses/date/${date}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch expenses: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error in getExpensesByDateAction:", error)
    return []
  }
}

export async function addExpenseAction(expenseData: any) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(expenseData),
    })

    if (!response.ok) {
      throw new Error(`Failed to add expense: ${response.status}`)
    }

    const result = await response.json()
    revalidatePath("/expenses")
    return result
  } catch (error) {
    console.error("Error in addExpenseAction:", error)
    throw error
  }
}

export async function deleteExpenseAction(id: string) {
  try {
    console.log("Deleting expense with ID:", id)

    if (!id || id === "undefined") {
      console.error("Invalid expense ID:", id)
      return { success: false, error: "Invalid expense ID" }
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/expenses/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to delete expense: ${response.status} - ${errorText}`)
    }

    revalidatePath("/expenses")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteExpenseAction:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete expense" }
  }
}
