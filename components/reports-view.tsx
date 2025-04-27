"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Check, X, Download, User, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getEmployeesAction } from "@/lib/attendance-actions"
import { getAttendanceAction, getExpensesAction } from "@/lib/report-actions"
import type { Employee, AttendanceRecord, Expense } from "@/lib/db"
import { cn } from "@/lib/utils"

export function ReportsView() {
  const { toast } = useToast()
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
  )
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<string>("combined")
  const [isLoading, setIsLoading] = useState(true)

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)

        // Load employees
        const employeesData = await getEmployeesAction()
        setEmployees(employeesData)

        // Load attendance and expenses
        const attendanceData = await getAttendanceAction()
        const expensesData = await getExpensesAction()

        setAttendance(attendanceData)
        setExpenses(expensesData)

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load report data. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  // Generate array of months for the select dropdown
  const getMonthOptions = () => {
    const options = []
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()

    // Generate options for the last 12 months
    for (let i = 0; i < 12; i++) {
      let month = currentMonth - i
      let year = currentYear

      if (month < 0) {
        month += 12
        year -= 1
      }

      const monthValue = `${year}-${String(month + 1).padStart(2, "0")}`
      const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })

      options.push({ value: monthValue, label: monthLabel })
    }

    return options
  }

  // Filter attendance records by month and employee
  const getFilteredAttendance = () => {
    const [year, month] = selectedMonth.split("-")

    return attendance.filter((record) => {
      const recordDate = new Date(record.date)
      const recordYear = recordDate.getFullYear().toString()
      const recordMonth = String(recordDate.getMonth() + 1).padStart(2, "0")

      const matchesMonth = recordYear === year && recordMonth === month
      const matchesEmployee = selectedEmployee === "all" || record.employeeId === Number.parseInt(selectedEmployee)

      return matchesMonth && matchesEmployee
    })
  }

  // Filter expenses by month and employee
  const getFilteredExpenses = () => {
    const [year, month] = selectedMonth.split("-")

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      const expenseYear = expenseDate.getFullYear().toString()
      const expenseMonth = String(expenseDate.getMonth() + 1).padStart(2, "0")

      const matchesMonth = expenseYear === year && expenseMonth === month
      const matchesEmployee = selectedEmployee === "all" || expense.employeeId === Number.parseInt(selectedEmployee)

      return matchesMonth && matchesEmployee
    })
  }

  // Calculate attendance statistics
  const getAttendanceStats = () => {
    const filteredAttendance = getFilteredAttendance()
    const totalDays = new Set(filteredAttendance.map((record) => record.date)).size
    const presentDays = filteredAttendance.filter((record) => record.present).length
    const absentDays = filteredAttendance.filter((record) => !record.present).length

    return {
      totalDays,
      presentDays,
      absentDays,
      attendanceRate: totalDays > 0 ? (presentDays / filteredAttendance.length) * 100 : 0,
    }
  }

  // Calculate expense statistics
  const getExpenseStats = () => {
    const filteredExpenses = getFilteredExpenses()
    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const categories = filteredExpenses.reduce(
      (acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalAmount,
      expenseCount: filteredExpenses.length,
      categories,
    }
  }

  // Group attendance by date for display
  const getAttendanceByDate = () => {
    const filteredAttendance = getFilteredAttendance()
    const groupedByDate: Record<string, AttendanceRecord[]> = {}

    filteredAttendance.forEach((record) => {
      if (!groupedByDate[record.date]) {
        groupedByDate[record.date] = []
      }
      groupedByDate[record.date].push(record)
    })

    // Sort dates in descending order
    return Object.entries(groupedByDate)
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
      .map(([date, records]) => ({
        date,
        records: records.sort((a, b) => a.employeeId - b.employeeId),
      }))
  }

  // Get combined attendance and expense data
  const getCombinedData = () => {
    const [year, month] = selectedMonth.split("-")
    const employeeId = selectedEmployee === "all" ? null : Number.parseInt(selectedEmployee)

    // Get all dates in the selected month with data
    const allDates = new Set([...attendance.map((record) => record.date), ...expenses.map((expense) => expense.date)])

    // Filter dates by month
    const datesInMonth = Array.from(allDates).filter((date) => {
      const dateObj = new Date(date)
      return dateObj.getFullYear().toString() === year && String(dateObj.getMonth() + 1).padStart(2, "0") === month
    })

    return datesInMonth
      .map((date) => {
        // Get attendance for this date
        const attendanceRecords = attendance.filter(
          (record) => record.date === date && (employeeId === null || record.employeeId === employeeId),
        )

        // Get expenses for this date
        const expenseRecords = expenses.filter(
          (expense) => expense.date === date && (employeeId === null || expense.employeeId === employeeId),
        )

        // Calculate totals
        const presentCount = attendanceRecords.filter((record) => record.present).length
        const absentCount = attendanceRecords.filter((record) => !record.present).length
        const totalExpense = expenseRecords.reduce((sum, expense) => sum + expense.amount, 0)

        return {
          date,
          formattedDate: new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            weekday: "short",
          }),
          attendanceRecords,
          expenseRecords,
          presentCount,
          absentCount,
          totalExpense,
          hasData: attendanceRecords.length > 0 || expenseRecords.length > 0,
        }
      })
      .filter((item) => item.hasData)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  // Export attendance data as CSV
  const exportAttendanceCSV = () => {
    const filteredAttendance = getFilteredAttendance()
    if (filteredAttendance.length === 0) return

    const headers = ["Date", "Employee", "Status"]
    const rows = filteredAttendance.map((record) => [
      new Date(record.date).toLocaleDateString(),
      employees.find((emp) => emp.id === record.employeeId)?.name || "Unknown",
      record.present ? "Present" : "Absent",
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    downloadCSV(csvContent, `attendance-report-${selectedMonth}`)
  }

  // Export expense data as CSV
  const exportExpenseCSV = () => {
    const filteredExpenses = getFilteredExpenses()
    if (filteredExpenses.length === 0) return

    const headers = ["Date", "Employee", "Amount", "Category", "Description"]
    const rows = filteredExpenses.map((expense) => [
      new Date(expense.date).toLocaleDateString(),
      employees.find((emp) => emp.id === expense.employeeId)?.name || "Unknown",
      expense.amount.toFixed(2),
      expense.category,
      `"${expense.description.replace(/"/g, '""')}"`,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    downloadCSV(csvContent, `expense-report-${selectedMonth}`)
  }

  // Helper function to download CSV
  const downloadCSV = (csvContent: string, fileName: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${fileName}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const attendanceStats = getAttendanceStats()
  const expenseStats = getExpenseStats()
  const attendanceByDate = getAttendanceByDate()
  const combinedData = getCombinedData()

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading report data...</div>
  }

  return (
    <>
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Month</label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="h-9 rounded-lg">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {getMonthOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Employee</label>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="h-9 rounded-lg">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id.toString()}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="combined" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 grid w-full grid-cols-3 rounded-lg">
          <TabsTrigger value="combined">Combined View</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="combined">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle>Attendance Rate</CardTitle>
                <CardDescription>
                  {selectedEmployee === "all"
                    ? "All employees"
                    : employees.find((emp) => emp.id.toString() === selectedEmployee)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{attendanceStats.attendanceRate.toFixed(1)}%</div>
                <div className="mt-2 flex gap-2">
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  >
                    <Check className="mr-1 h-3 w-3" /> {attendanceStats.presentDays} present
                  </Badge>
                  <Badge variant="outline" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    <X className="mr-1 h-3 w-3" /> {attendanceStats.absentDays} absent
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle>Total Expenses</CardTitle>
                <CardDescription>
                  {new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${expenseStats.totalAmount.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">{expenseStats.expenseCount} expense entries</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle>Export Data</CardTitle>
                <CardDescription>Download reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={exportAttendanceCSV}
                  disabled={getFilteredAttendance().length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Attendance
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={exportExpenseCSV}
                  disabled={getFilteredExpenses().length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Expenses
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 border-none shadow-md">
            <CardHeader>
              <CardTitle>Combined Attendance & Expense History</CardTitle>
              <CardDescription>
                {new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {combinedData.length > 0 ? (
                <div className="space-y-6">
                  {combinedData.map((item) => (
                    <div key={item.date} className="rounded-lg border">
                      <div className="flex items-center gap-2 border-b bg-muted/50 p-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">{item.formattedDate}</h3>
                      </div>
                      <div className="p-3">
                        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div className="rounded-lg bg-muted/30 p-3">
                            <div className="mb-2 flex items-center gap-2">
                              <User className="h-4 w-4 text-primary" />
                              <h4 className="font-medium">Attendance</h4>
                            </div>
                            {item.attendanceRecords.length > 0 ? (
                              <div className="space-y-2">
                                {item.attendanceRecords.map((record) => (
                                  <div
                                    key={`${record.date}-${record.employeeId}`}
                                    className="flex items-center justify-between"
                                  >
                                    <span
                                      className={`text-sm ${record.present ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
                                    >
                                      {employees.find((emp) => emp.id === record.employeeId)?.name}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-xs",
                                        record.present
                                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                                      )}
                                    >
                                      {record.present ? (
                                        <Check className="mr-1 h-3 w-3" />
                                      ) : (
                                        <X className="mr-1 h-3 w-3" />
                                      )}
                                      {record.present ? "Present" : "Absent"}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center text-sm text-muted-foreground">No attendance records</div>
                            )}
                          </div>
                          <div className="rounded-lg bg-muted/30 p-3">
                            <div className="mb-2 flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-primary" />
                              <h4 className="font-medium">Expenses</h4>
                            </div>
                            {item.expenseRecords.length > 0 ? (
                              <div className="space-y-2">
                                {item.expenseRecords.map((expense) => (
                                  <div key={expense.id} className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                      <span className="text-sm">
                                        {employees.find((emp) => emp.id === expense.employeeId)?.name}
                                      </span>
                                      <span className="text-xs text-muted-foreground">{expense.category}</span>
                                    </div>
                                    <span className="font-medium">${expense.amount.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center text-sm text-muted-foreground">No expense records</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-muted/10 p-2 text-sm">
                          <div>
                            <span className="font-medium">Summary:</span>{" "}
                            <span className="text-green-700 dark:text-green-400">{item.presentCount} present</span>,{" "}
                            <span className="text-red-700 dark:text-red-400">{item.absentCount} absent</span>
                          </div>
                          <div>
                            <span className="font-medium">Total Expenses:</span> ${item.totalExpense.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  No records found for this period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle>Attendance Rate</CardTitle>
                <CardDescription>
                  {selectedEmployee === "all"
                    ? "All employees"
                    : employees.find((emp) => emp.id.toString() === selectedEmployee)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{attendanceStats.attendanceRate.toFixed(1)}%</div>
                <div className="mt-2 flex gap-2">
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  >
                    <Check className="mr-1 h-3 w-3" /> {attendanceStats.presentDays} present
                  </Badge>
                  <Badge variant="outline" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    <X className="mr-1 h-3 w-3" /> {attendanceStats.absentDays} absent
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle>Working Days</CardTitle>
                <CardDescription>Total days with records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{attendanceStats.totalDays}</div>
                <p className="text-sm text-muted-foreground">
                  In {new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle>Export</CardTitle>
                <CardDescription>Download attendance data</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={exportAttendanceCSV}
                  disabled={getFilteredAttendance().length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 border-none shadow-md">
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>
                {new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceByDate.length > 0 ? (
                <div className="space-y-6">
                  {attendanceByDate.map(({ date, records }) => (
                    <div key={date} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-medium">
                          {new Date(date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </h3>
                      </div>
                      <div className="rounded-md border">
                        <div className="grid grid-cols-2 gap-4 border-b bg-muted/50 p-3 font-medium md:grid-cols-3">
                          <div>Employee</div>
                          <div className="text-right md:text-left">Status</div>
                          <div className="hidden md:block">ID</div>
                        </div>
                        {records.map((record) => (
                          <div
                            key={`${record.date}-${record.employeeId}`}
                            className={`grid grid-cols-2 gap-4 border-b p-3 last:border-0 md:grid-cols-3 ${
                              record.present ? "bg-green-50 dark:bg-green-900/10" : "bg-red-50 dark:bg-red-900/10"
                            }`}
                          >
                            <div
                              className={
                                record.present ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                              }
                            >
                              {employees.find((emp) => emp.id === record.employeeId)?.name || "Unknown"}
                            </div>
                            <div className="text-right md:text-left">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "rounded-full",
                                  record.present
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                                )}
                              >
                                {record.present ? <Check className="mr-1 h-3 w-3" /> : <X className="mr-1 h-3 w-3" />}
                                {record.present ? "Present" : "Absent"}
                              </Badge>
                            </div>
                            <div className="hidden text-muted-foreground md:block">#{record.employeeId}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  No attendance records found for this period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle>Total Expenses</CardTitle>
                <CardDescription>
                  {selectedEmployee === "all"
                    ? "All employees"
                    : employees.find((emp) => emp.id.toString() === selectedEmployee)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${expenseStats.totalAmount.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">{expenseStats.expenseCount} expense entries</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle>Top Category</CardTitle>
                <CardDescription>Highest spending category</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(expenseStats.categories).length > 0 ? (
                  <>
                    <div className="text-xl font-bold">
                      {Object.entries(expenseStats.categories).sort(([, a], [, b]) => b - a)[0][0]}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      $
                      {Object.entries(expenseStats.categories)
                        .sort(([, a], [, b]) => b - a)[0][1]
                        .toFixed(2)}
                    </p>
                  </>
                ) : (
                  <div className="text-muted-foreground">No data</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader className="pb-2">
                <CardTitle>Export</CardTitle>
                <CardDescription>Download expense data</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={exportExpenseCSV}
                  disabled={getFilteredExpenses().length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 border-none shadow-md">
            <CardHeader>
              <CardTitle>Expense History</CardTitle>
              <CardDescription>
                {new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getFilteredExpenses().length > 0 ? (
                <div className="space-y-4">
                  {getFilteredExpenses()
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((expense) => (
                      <div key={expense.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">
                            {employees.find((emp) => emp.id === expense.employeeId)?.name || "Unknown"}
                          </div>
                          <div className="font-bold">${expense.amount.toFixed(2)}</div>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm">
                            <span className="inline-block rounded-full bg-secondary px-2 py-1 text-xs">
                              {expense.category}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm">{expense.description}</div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  No expense records found for this period
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
