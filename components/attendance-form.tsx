"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon, Check, X } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { employeeApi, attendanceApi } from "@/lib/api"
import { LoadingSpinner } from "@/components/loading-spinner"

type Employee = {
  _id: string
  id?: string
  name: string
  position?: string
}

type AttendanceRecord = {
  employeeId: string
  date: string
  present: boolean
}

export function AttendanceForm() {
  const [date, setDate] = useState<Date>(new Date())
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showCalendar, setShowCalendar] = useState(true)
  const [attendanceDates, setAttendanceDates] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  // Format date to YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return format(date, "yyyy-MM-dd")
  }

  // Fetch attendance for a specific date
  const fetchAttendanceForDate = async (selectedDate: Date) => {
    try {
      setIsLoading(true)
      const formattedDate = formatDate(selectedDate)
      console.log("Fetching attendance for date:", formattedDate)

      const data = await attendanceApi.getByDate(formattedDate)
      console.log("Attendance data for date:", data)

      // Update attendance state
      const newAttendance: Record<string, AttendanceRecord> = {}

      // Initialize with all employees set to no attendance record
      employees.forEach((employee) => {
        const employeeId = employee._id || employee.id
        if (employeeId) {
          newAttendance[employeeId] = {
            employeeId,
            date: formattedDate,
            present: false, // Default value
          }
        }
      })

      // Update with actual attendance records
      if (Array.isArray(data)) {
        data.forEach((record: any) => {
          const employeeId = record.employeeId || (record.employee && record.employee._id)
          if (employeeId) {
            newAttendance[employeeId] = {
              employeeId,
              date: formattedDate,
              present: record.present,
            }
          }
        })
      }

      setAttendance(newAttendance)
      console.log("Updated attendance state:", newAttendance)
    } catch (error) {
      console.error("Failed to fetch attendance:", error)
      toast({
        title: "Error",
        description: "Failed to load attendance data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch all attendance records to mark dates in calendar
  const fetchAllAttendance = async () => {
    try {
      const data = await attendanceApi.getAll()
      const dates = new Set<string>()

      if (Array.isArray(data)) {
        data.forEach((record: any) => {
          // Convert date to YYYY-MM-DD format if it's not already
          let dateStr = record.date
          if (dateStr instanceof Date) {
            dateStr = formatDate(dateStr)
          } else if (typeof dateStr === "string" && dateStr.includes("T")) {
            dateStr = dateStr.split("T")[0]
          }
          dates.add(dateStr)
        })
      }

      setAttendanceDates(dates)
      console.log("Dates with attendance:", dates)
    } catch (error) {
      console.error("Failed to fetch all attendance:", error)
    }
  }

  // Fetch employees on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true)
        const data = await employeeApi.getAll()
        console.log("Fetched employees:", data)

        // Ensure we have an array of employees with consistent ID field
        const formattedEmployees = Array.isArray(data)
          ? data.map((emp) => ({
              _id: emp._id || emp.id,
              id: emp.id || emp._id,
              name: emp.name || "Unknown",
              position: emp.position || "",
            }))
          : []

        setEmployees(formattedEmployees)

        // Fetch attendance for the current date
        await fetchAttendanceForDate(date)

        // Fetch all attendance to mark dates in calendar
        await fetchAllAttendance()
      } catch (error) {
        console.error("Failed to fetch employees:", error)
        toast({
          title: "Error",
          description: "Failed to load employees. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployees()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDateChange = async (newDate: Date) => {
    setDate(newDate)
    await fetchAttendanceForDate(newDate)
  }

  const handleAttendanceChange = (employeeId: string, present: boolean) => {
    setAttendance((prev) => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        present,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const formattedDate = formatDate(date)
      const records = Object.values(attendance)

      if (records.length === 0) {
        toast({
          title: "No changes",
          description: "Please mark attendance for at least one employee.",
        })
        setIsSaving(false)
        return
      }

      console.log("Saving attendance records:", records)

      // Save each attendance record individually
      for (const record of records) {
        await attendanceApi.mark({
          employeeId: record.employeeId,
          date: formattedDate,
          present: record.present,
        })
      }

      // Update the set of dates with attendance
      setAttendanceDates((prev) => {
        const newSet = new Set(prev)
        newSet.add(formattedDate)
        return newSet
      })

      toast({
        title: "Success",
        description: "Attendance has been saved successfully.",
      })

      // Refresh attendance data
      await fetchAttendanceForDate(date)
    } catch (error) {
      console.error("Failed to save attendance:", error)
      toast({
        title: "Error",
        description: "Failed to save attendance. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Count attendance stats
  const getAttendanceStats = () => {
    const presentCount = Object.values(attendance).filter((a) => a.present).length
    const absentCount = Object.values(attendance).filter((a) => a.present === false).length
    const unmarkedCount = employees.length - (presentCount + absentCount)

    return { presentCount, absentCount, unmarkedCount }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Attendance</h1>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, "EEEE, MMMM d, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && handleDateChange(date)}
              initialFocus
              modifiers={{
                hasAttendance: (date) => {
                  const dateStr = formatDate(date)
                  return attendanceDates.has(dateStr)
                },
              }}
              modifiersClassNames={{
                hasAttendance: "bg-gray-200 text-gray-700 font-medium",
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {showCalendar && (
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
              <CardDescription>Choose a date to mark attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && handleDateChange(date)}
                className="rounded-md border"
                modifiers={{
                  hasAttendance: (date) => {
                    const dateStr = formatDate(date)
                    return attendanceDates.has(dateStr)
                  },
                }}
                modifiersClassNames={{
                  hasAttendance: "bg-gray-200 text-gray-700 font-medium",
                }}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
            <CardDescription>{format(date, "EEEE, MMMM d, yyyy")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-green-50 p-4 rounded-md text-center border border-green-200">
                <div className="text-2xl font-bold text-green-600">{getAttendanceStats().presentCount}</div>
                <div className="text-sm text-green-600">Present</div>
              </div>
              <div className="bg-red-50 p-4 rounded-md text-center border border-red-200">
                <div className="text-2xl font-bold text-red-600">{getAttendanceStats().absentCount}</div>
                <div className="text-sm text-red-600">Absent</div>
              </div>
              <div className="bg-gray-100 p-4 rounded-md text-center border border-gray-200">
                <div className="text-2xl font-bold text-gray-600">{getAttendanceStats().unmarkedCount}</div>
                <div className="text-sm text-gray-600">Unmarked</div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowCalendar(!showCalendar)} className="mb-4">
              {showCalendar ? "Hide Calendar" : "Show Calendar"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          {employees.length === 0 ? (
            <div className="p-4 text-center bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">No employees found. Add employees to mark attendance.</p>
            </div>
          ) : (
            employees.map((employee) => {
              const employeeId = employee._id || employee.id || ""
              const record = attendance[employeeId]
              const isPresent = record?.present === true
              const isAbsent = record?.present === false

              return (
                <div
                  key={employeeId}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    isPresent
                      ? "bg-green-50 border-green-200"
                      : isAbsent
                        ? "bg-red-50 border-red-200"
                        : "bg-white border-gray-200",
                  )}
                >
                  <div className="font-medium">{employee.name}</div>

                  <div className="flex items-center space-x-4">
                    {(isPresent || isAbsent) && (
                      <div
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium flex items-center",
                          isPresent ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
                        )}
                      >
                        {isPresent ? (
                          <>
                            <Check className="w-3 h-3 mr-1" /> Present
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 mr-1" /> Absent
                          </>
                        )}
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <label
                        className={cn(
                          "flex items-center justify-center w-6 h-6 rounded-full border cursor-pointer",
                          isPresent ? "bg-green-500 border-green-500 text-white" : "bg-white border-gray-300",
                        )}
                      >
                        <input
                          type="radio"
                          name={`attendance-${employeeId}`}
                          value="PRESENT"
                          checked={isPresent}
                          onChange={() => handleAttendanceChange(employeeId, true)}
                          className="sr-only"
                        />
                        {isPresent && <Check className="w-4 h-4" />}
                      </label>

                      <span className="text-sm">Present</span>

                      <label
                        className={cn(
                          "flex items-center justify-center w-6 h-6 rounded-full border cursor-pointer",
                          isAbsent ? "bg-red-500 border-red-500 text-white" : "bg-white border-gray-300",
                        )}
                      >
                        <input
                          type="radio"
                          name={`attendance-${employeeId}`}
                          value="ABSENT"
                          checked={isAbsent}
                          onChange={() => handleAttendanceChange(employeeId, false)}
                          className="sr-only"
                        />
                        {isAbsent && <X className="w-4 h-4" />}
                      </label>

                      <span className="text-sm">Absent</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving || employees.length === 0}>
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              "Save Attendance"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
