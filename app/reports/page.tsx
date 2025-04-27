"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Download, Check, X, Calendar, Filter, ArrowUpDown, Search, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { employeeApi, attendanceApi, expenseApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export default function ReportsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isFiltering, setIsFiltering] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
  )
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
  const [sortBy, setSortBy] = useState<"date" | "name" | "status">("date")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  })
  const [employeeMap, setEmployeeMap] = useState<Record<string, any>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch employees
        const employeesData = await employeeApi.getAll()
        setEmployees(employeesData)

        // Create a map of employee IDs to employee objects for quick lookup
        const empMap: Record<string, any> = {}
        employeesData.forEach((emp: any) => {
          if (emp) {
            // Handle both MongoDB ObjectID (_id) and regular id
            if (emp._id) empMap[emp._id.toString()] = emp
            if (emp.id) empMap[emp.id.toString()] = emp
          }
        })
        setEmployeeMap(empMap)
        console.log("Employee map created:", empMap)

        // Fetch all attendance
        const attendanceData = await attendanceApi.getAll()
        setAttendance(attendanceData)

        // Fetch all expenses
        const expensesData = await expenseApi.getAll()
        setExpenses(expensesData)

        // Generate recent activity
        generateRecentActivity(attendanceData, expensesData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load report data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setTimeout(() => {
          setIsLoading(false)
        }, 800) // Add a slight delay to show the loading animation
      }
    }

    fetchData()
  }, [])

  // Generate recent activity from attendance and expense data
  const generateRecentActivity = (attendanceData: any[], expensesData: any[]) => {
    // Combine attendance and expense data
    const allActivities = [
      ...attendanceData.map((record) => ({
        type: "attendance",
        date: record.date,
        employeeId: record.employeeId,
        status: record.present ? "present" : "absent",
        timestamp: new Date(record.date).getTime(),
      })),
      ...expensesData.map((expense) => ({
        type: "expense",
        date: expense.date,
        employeeId: expense.employeeId,
        amount: expense.amount,
        category: expense.category,
        timestamp: new Date(expense.date).getTime(),
      })),
    ]

    // Add some mock lending activities
    const lendingActivities = [
      {
        type: "lending",
        date: new Date().toISOString().split("T")[0],
        employeeId: employees[0]?._id || "",
        item: "Ladder",
        returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        timestamp: Date.now() - 2 * 60 * 60 * 1000,
      },
      {
        type: "lending",
        date: new Date().toISOString().split("T")[0],
        employeeId: employees[0]?._id || "",
        item: "Power Drill",
        returnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        timestamp: Date.now() - 5 * 60 * 60 * 1000,
      },
    ]

    allActivities.push(...lendingActivities)

    // Sort by timestamp (most recent first)
    allActivities.sort((a, b) => b.timestamp - a.timestamp)

    // Take the 10 most recent activities
    setRecentActivity(allActivities.slice(0, 10))
  }

  // Filter attendance records by month, employee, and search query
  const getFilteredAttendance = () => {
    let filtered = [...attendance]

    // Apply date filtering
    if (selectedMonth !== "all") {
      const [year, month] = selectedMonth.split("-")
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.date)
        const recordYear = recordDate.getFullYear().toString()
        const recordMonth = String(recordDate.getMonth() + 1).padStart(2, "0")
        return recordYear === year && recordMonth === month
      })
    }

    // Apply date range filtering if provided
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.date)
        const startDate = new Date(dateRange.start)
        const endDate = new Date(dateRange.end)
        return recordDate >= startDate && recordDate <= endDate
      })
    }

    // Apply employee filtering
    if (selectedEmployee !== "all") {
      filtered = filtered.filter((record) => record.employeeId === selectedEmployee)
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((record) => {
        const employee = employeeMap[record.employeeId]
        if (!employee) return false
        return employee.name.toLowerCase().includes(query)
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc"
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (sortBy === "name") {
        const employeeA = employeeMap[a.employeeId]
        const employeeB = employeeMap[b.employeeId]
        if (!employeeA || !employeeB) return 0
        return sortOrder === "desc"
          ? employeeB.name.localeCompare(employeeA.name)
          : employeeA.name.localeCompare(employeeB.name)
      } else if (sortBy === "status") {
        return sortOrder === "desc"
          ? (b.present ? 1 : 0) - (a.present ? 1 : 0)
          : (a.present ? 1 : 0) - (b.present ? 1 : 0)
      }
      return 0
    })

    return filtered
  }

  // Filter expenses by month, employee, and search query
  const getFilteredExpenses = () => {
    let filtered = [...expenses]

    // Apply date filtering
    if (selectedMonth !== "all") {
      const [year, month] = selectedMonth.split("-")
      filtered = filtered.filter((expense) => {
        const expenseDate = new Date(expense.date)
        const expenseYear = expenseDate.getFullYear().toString()
        const expenseMonth = String(expenseDate.getMonth() + 1).padStart(2, "0")
        return expenseYear === year && expenseMonth === month
      })
    }

    // Apply date range filtering if provided
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((expense) => {
        const expenseDate = new Date(expense.date)
        const startDate = new Date(dateRange.start)
        const endDate = new Date(dateRange.end)
        return expenseDate >= startDate && expenseDate <= endDate
      })
    }

    // Apply employee filtering
    if (selectedEmployee !== "all") {
      filtered = filtered.filter((expense) => expense.employeeId === selectedEmployee)
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((expense) => {
        const employee = employeeMap[expense.employeeId]
        if (!employee) return false
        return (
          employee.name.toLowerCase().includes(query) ||
          expense.description.toLowerCase().includes(query) ||
          expense.category.toLowerCase().includes(query)
        )
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc"
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (sortBy === "name") {
        const employeeA = employeeMap[a.employeeId]
        const employeeB = employeeMap[b.employeeId]
        if (!employeeA || !employeeB) return 0
        return sortOrder === "desc"
          ? employeeB.name.localeCompare(employeeA.name)
          : employeeA.name.localeCompare(employeeB.name)
      }
      return 0
    })

    return filtered
  }

  // Calculate attendance statistics
  const getAttendanceStats = () => {
    const filteredAttendance = getFilteredAttendance()
    const totalRecords = filteredAttendance.length
    const presentDays = filteredAttendance.filter((record) => record.present).length
    const absentDays = filteredAttendance.filter((record) => !record.present).length

    return {
      totalRecords,
      presentDays,
      absentDays,
      attendanceRate: totalRecords > 0 ? (presentDays / totalRecords) * 100 : 0,
    }
  }

  // Calculate expense statistics
  const getExpenseStats = () => {
    const filteredExpenses = getFilteredExpenses()
    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    return {
      totalAmount,
      expenseCount: filteredExpenses.length,
    }
  }

  const getEmployeeName = (id: string | number | undefined) => {
    if (!id) return "Unknown"

    // Convert id to string for comparison
    const idStr = id.toString()

    // First check in the employee map
    if (employeeMap[idStr] && employeeMap[idStr].name) {
      return employeeMap[idStr].name
    }

    // Fallback to searching in the employees array
    const employee = employees.find((emp) => {
      if (!emp) return false
      const empId = emp._id ? emp._id.toString() : emp.id ? emp.id.toString() : null
      return empId === idStr
    })

    return employee ? employee.name : "Unknown"
  }

  // Generate array of months for the select dropdown
  const getMonthOptions = () => {
    const options = [{ value: "all", label: "All Time" }]
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

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Group attendance records by date
  const groupAttendanceByDate = () => {
    const filteredAttendance = getFilteredAttendance()
    const groupedByDate: Record<string, any[]> = {}

    filteredAttendance.forEach((record) => {
      if (!groupedByDate[record.date]) {
        groupedByDate[record.date] = []
      }
      groupedByDate[record.date].push(record)
    })

    // Convert to array and sort by date
    return Object.entries(groupedByDate)
      .map(([date, records]) => ({
        date,
        formattedDate: formatDate(date),
        records: records.sort((a, b) => {
          const employeeA = employeeMap[a.employeeId]
          const employeeB = employeeMap[b.employeeId]
          if (!employeeA || !employeeB) return 0
          return employeeA.name.localeCompare(employeeB.name)
        }),
      }))
      .sort((a, b) => {
        return sortOrder === "desc"
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime()
      })
  }

  const attendanceStats = getAttendanceStats()
  const expenseStats = getExpenseStats()
  const groupedAttendance = groupAttendanceByDate()

  // Export attendance data as Excel
  const exportAttendanceExcel = () => {
    const filteredAttendance = getFilteredAttendance()
    if (filteredAttendance.length === 0) return

    // Prepare data for Excel
    const data = [
      ["Date", "Employee", "Status"], // Headers
      ...filteredAttendance.map((record) => [
        new Date(record.date).toLocaleDateString(),
        getEmployeeName(record.employeeId),
        record.present ? "Present" : "Absent",
      ]),
    ]

    // Generate Excel file using XLSX library
    downloadExcel(data, `attendance-report-${selectedMonth}`)
  }

  // Export expense data as Excel
  const exportExpenseExcel = () => {
    const filteredExpenses = getFilteredExpenses()
    if (filteredExpenses.length === 0) return

    // Prepare data for Excel
    const data = [
      ["Date", "Employee", "Amount (₹)", "Category", "Description"], // Headers
      ...filteredExpenses.map((expense) => [
        new Date(expense.date).toLocaleDateString(),
        getEmployeeName(expense.employeeId),
        expense.amount.toFixed(2),
        expense.category,
        expense.description,
      ]),
    ]

    // Generate Excel file using XLSX library
    downloadExcel(data, `expense-report-${selectedMonth}`)
  }

  // Helper function to download Excel
  const downloadExcel = (data: any[][], fileName: string) => {
    import("xlsx")
      .then((XLSX) => {
        // Create a worksheet
        const ws = XLSX.utils.aoa_to_sheet(data)

        // Create a workbook
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Report")

        // Generate Excel file
        XLSX.writeFile(wb, `${fileName}.xlsx`)
      })
      .catch((error) => {
        console.error("Error loading XLSX library:", error)
        toast({
          title: "Error",
          description: "Failed to generate Excel file. Please try again.",
          variant: "destructive",
        })
      })
  }

  // Toggle filter panel
  const toggleFilters = () => {
    setIsFiltering(!isFiltering)
  }

  // Reset all filters
  const resetFilters = () => {
    setSelectedMonth(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`)
    setSelectedEmployee("all")
    setSortOrder("desc")
    setSortBy("date")
    setSearchQuery("")
    setDateRange({ start: "", end: "" })
  }

  // Format activity message
  const formatActivityMessage = (activity: any) => {
    const employeeName = getEmployeeName(activity.employeeId)

    if (activity.type === "attendance") {
      return `${employeeName} was marked ${activity.status} on ${formatDate(activity.date)}`
    } else if (activity.type === "expense") {
      return `${employeeName} submitted a ${activity.category} expense of $${activity.amount.toFixed(2)}`
    } else if (activity.type === "lending") {
      return `${employeeName} borrowed ${activity.item} (due: ${formatDate(activity.returnDate)})`
    }
    return ""
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">View and export attendance and expense reports.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={toggleFilters} className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {isFiltering && (
              <Badge variant="secondary" className="ml-2">
                Active
              </Badge>
            )}
          </Button>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="flex items-center gap-1"
          >
            <ArrowUpDown className="h-4 w-4" />
            {sortOrder === "desc" ? "Newest First" : "Oldest First"}
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {isFiltering && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-muted/40 rounded-lg p-4 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Employee</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee._id} value={employee._id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy as any}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="name">Employee Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range (Start)</label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range (End)</label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={resetFilters} className="mr-2">
              Reset
            </Button>
            <Button onClick={toggleFilters}>Apply Filters</Button>
          </div>
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Attendance Rate</CardTitle>
            <CardDescription>
              {selectedEmployee === "all" ? "All employees" : getEmployeeName(selectedEmployee)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold">{attendanceStats.attendanceRate.toFixed(1)}%</div>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-700">
                    <Check className="mr-1 h-3 w-3" /> {attendanceStats.presentDays} present
                  </Badge>
                  <Badge variant="outline" className="bg-red-100 text-red-700">
                    <X className="mr-1 h-3 w-3" /> {attendanceStats.absentDays} absent
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Expenses</CardTitle>
            <CardDescription>
              {selectedMonth === "all"
                ? "All time"
                : new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold">₹{expenseStats.totalAmount.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">{expenseStats.expenseCount} expense entries</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Export Data</CardTitle>
            <CardDescription>Download reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={exportAttendanceExcel}
              disabled={getFilteredAttendance().length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Attendance
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={exportExpenseExcel}
              disabled={getFilteredExpenses().length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Expenses
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="attendance">Attendance Records</TabsTrigger>
          <TabsTrigger value="expenses">Expense Records</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>
                {selectedMonth === "all"
                  ? "All time"
                  : new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                {searchQuery && ` • Search: "${searchQuery}"`}
                {dateRange.start &&
                  dateRange.end &&
                  ` • ${formatDate(dateRange.start)} to ${formatDate(dateRange.end)}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Loader2 className="h-8 w-8 text-primary" />
                  </motion.div>
                </div>
              ) : groupedAttendance.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  No attendance records found for this period
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedAttendance.map((group) => (
                    <motion.div
                      key={group.date}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-medium">{group.formattedDate}</h3>
                      </div>
                      <div className="space-y-2">
                        {group.records.map((record) => (
                          <motion.div
                            key={`${record.date}-${record.employeeId}`}
                            whileHover={{ scale: 1.01 }}
                            className="flex items-center justify-between p-3 border rounded-md"
                          >
                            <div className="font-medium">{getEmployeeName(record.employeeId)}</div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "flex items-center gap-1",
                                record.present
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                              )}
                            >
                              {record.present ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                              {record.present ? "Present" : "Absent"}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Expense History</CardTitle>
              <CardDescription>
                {selectedMonth === "all"
                  ? "All time"
                  : new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                {searchQuery && ` • Search: "${searchQuery}"`}
                {dateRange.start &&
                  dateRange.end &&
                  ` • ${formatDate(dateRange.start)} to ${formatDate(dateRange.end)}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Loader2 className="h-8 w-8 text-primary" />
                  </motion.div>
                </div>
              ) : getFilteredExpenses().length === 0 ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  No expense records found for this period
                </div>
              ) : (
                <div className="space-y-4">
                  {getFilteredExpenses()
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((expense) => (
                      <motion.div
                        key={expense.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-lg border p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{getEmployeeName(expense.employeeId)}</div>
                          <div className="font-bold">₹{expense.amount.toFixed(2)}</div>
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          <span className="inline-block rounded-full bg-secondary px-2 py-1 text-xs">
                            {expense.category}
                          </span>
                          <span className="ml-2">{formatDate(expense.date)}</span>
                        </div>
                        <div className="mt-2 text-sm">{expense.description}</div>
                      </motion.div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions and events</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Loader2 className="h-8 w-8 text-primary" />
                  </motion.div>
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  No recent activity found
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-start gap-3 p-3 border-b last:border-0"
                    >
                      <div
                        className={cn(
                          "rounded-full p-2 flex-shrink-0",
                          activity.type === "attendance"
                            ? activity.status === "present"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                            : activity.type === "expense"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700",
                        )}
                      >
                        {activity.type === "attendance" ? (
                          activity.status === "present" ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <X className="h-4 w-4" />
                          )
                        ) : activity.type === "expense" ? (
                          <span className="text-xs font-bold">$</span>
                        ) : (
                          <span className="text-xs font-bold">!</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{formatActivityMessage(activity)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
