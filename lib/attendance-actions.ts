"use server"

import { revalidatePath } from "next/cache"

export async function markAttendance(date: Date, records: any[]) {
  try {
    console.log("Marking attendance for date:", date, "Records:", records)

    // Format date to YYYY-MM-DD
    const formattedDate = date.toISOString().split("T")[0]

    // Save each attendance record
    for (const record of records) {
      if (record.status !== null) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/attendance/mark`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeId: record.employeeId,
            date: formattedDate,
            present: record.status === "PRESENT",
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("Failed to mark attendance:", errorData)
          throw new Error(`Failed to mark attendance: ${errorData.error || response.statusText}`)
        }
      }
    }

    // Revalidate the attendance page
    revalidatePath("/attendance")

    return { success: true }
  } catch (error) {
    console.error("Error in markAttendance:", error)
    throw error
  }
}

export async function getEmployeesAction() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/employees`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch employees: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error in getEmployeesAction:", error)
    throw error
  }
}

export async function getAttendanceAction() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/attendance`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch attendance: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error in getAttendanceAction:", error)
    throw error
  }
}
