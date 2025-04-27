"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, UsersIcon, DollarSignIcon, BarChart2Icon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

// Helper function to format relative time
function formatRelativeTime(date: Date) {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffDay > 0) {
    return diffDay === 1 ? "Yesterday" : `${diffDay} days ago`
  }
  if (diffHour > 0) {
    return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`
  }
  if (diffMin > 0) {
    return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`
  }
  return "Just now"
}

export default function DashboardPage() {
  const { toast } = useToast()
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 0,
    presentToday: 0,
    attendanceRate: 0,
    monthlyExpenses: 0,
    expenseChange: 0,
    pendingApprovals: 0,
    recentActivity: [],
  })
  const [loading, setLoading] = useState(true)
  const [dataFetched, setDataFetched] = useState(false)

  useEffect(() => {
    // Only fetch data if it hasn't been fetched yet
    if (!dataFetched) {
      async function fetchDashboardData() {
        try {
          setLoading(true)

          // Fetch employees
          const employeesResponse = await fetch("/api/employees")
          const employeesData = await employeesResponse.json()

          // Ensure employees is an array
          const employees = Array.isArray(employeesData) ? employeesData : []
          console.log("Employees data:", employees)

          // Fetch attendance
          const attendanceResponse = await fetch("/api/attendance")
          const attendanceData = await attendanceResponse.json()

          // Ensure attendance is an array
          const attendance = Array.isArray(attendanceData) ? attendanceData : []
          console.log("Attendance data:", attendance)

          // Fetch expenses
          const expensesResponse = await fetch("/api/expenses")
          const expensesData = await expensesResponse.json()

          // Ensure expenses is an array
          const expenses = Array.isArray(expensesData) ? expensesData : []
          console.log("Expenses data:", expenses)

          // Calculate dashboard metrics
          const totalEmployees = employees.length

          // Get today's date in YYYY-MM-DD format
          const today = new Date().toISOString().split("T")[0]

          // Count present employees today
          const todayAttendance = attendance.filter(
            (record) => record.date && record.date.split("T")[0] === today && record.present,
          )
          const presentToday = todayAttendance.length
          const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0

          // Calculate monthly expenses
          const currentMonth = new Date().getMonth()
          const currentYear = new Date().getFullYear()

          // Use a traditional for loop instead of filter/reduce for better error handling
          let monthlyExpenses = 0
          for (let i = 0; i < expenses.length; i++) {
            const expense = expenses[i]
            if (expense && expense.date) {
              const expenseDate = new Date(expense.date)
              if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
                monthlyExpenses += Number(expense.amount) || 0
              }
            }
          }

          // For demo purposes, assume 12% increase
          const expenseChange = 12

          // For demo purposes, assume 3 pending approvals
          const pendingApprovals = 3

          // Create a comprehensive map of employee IDs to names
          const employeeMap = {}

          employees.forEach((emp) => {
            // Handle both _id and id formats
            if (emp._id) employeeMap[emp._id] = emp.name
            if (emp.id) employeeMap[emp.id] = emp.name

            // Handle string representation of ObjectId
            if (emp._id && typeof emp._id === "string") {
              employeeMap[emp._id.toString()] = emp.name
            }
          })

          // Process attendance records for activity feed
          const attendanceActivity = attendance.map((record) => {
            // Try different property names for employee ID
            const employeeId = record.employeeId || record.employee_id || record.employee || record._id
            let employeeName = "Unknown Employee"

            // Try to find the employee name
            if (employeeId) {
              if (employeeMap[employeeId]) {
                employeeName = employeeMap[employeeId]
              } else if (typeof employeeId === "object" && employeeId._id && employeeMap[employeeId._id]) {
                employeeName = employeeMap[employeeId._id]
              } else if (employeeId.toString && employeeMap[employeeId.toString()]) {
                employeeName = employeeMap[employeeId.toString()]
              }

              // If still unknown, try to find the employee directly
              if (employeeName === "Unknown Employee") {
                const employee = employees.find(
                  (e) =>
                    e._id === employeeId ||
                    e.id === employeeId ||
                    (e._id && e._id.toString() === employeeId.toString()),
                )
                if (employee) employeeName = employee.name
              }

              // If we still don't have a name, use a default name
              if (employeeName === "Unknown Employee") {
                employeeName = "Staff Member"
              }
            }

            const date = new Date(record.createdAt || record.date)
            return {
              type: "attendance",
              message: `${employeeName} marked attendance`,
              time: formatRelativeTime(date),
              date: date,
              raw: record,
            }
          })

          // Process expense records for activity feed
          const expenseActivity = expenses.map((expense) => {
            // Try different property names for employee ID
            const employeeId = expense.employeeId || expense.employee_id || expense.employee || expense._id
            let employeeName = "Unknown Employee"

            // Try to find the employee name
            if (employeeId) {
              if (employeeMap[employeeId]) {
                employeeName = employeeMap[employeeId]
              } else if (typeof employeeId === "object" && employeeId._id && employeeMap[employeeId._id]) {
                employeeName = employeeMap[employeeId._id]
              } else if (employeeId.toString && employeeMap[employeeId.toString()]) {
                employeeName = employeeMap[employeeId.toString()]
              }

              // If still unknown, try to find the employee directly
              if (employeeName === "Unknown Employee") {
                const employee = employees.find(
                  (e) =>
                    e._id === employeeId ||
                    e.id === employeeId ||
                    (e._id && e._id.toString() === employeeId.toString()),
                )
                if (employee) employeeName = employee.name
              }

              // If we still don't have a name, use a default name
              if (employeeName === "Unknown Employee") {
                employeeName = "Staff Member"
              }
            }

            const date = new Date(expense.createdAt || expense.date)
            return {
              type: "expense",
              message: `${employeeName} submitted an expense of ₹${expense.amount}`,
              time: formatRelativeTime(date),
              date: date,
              raw: expense,
            }
          })

          // Process employee records for activity feed (assuming newest employees are recent additions)
          const employeeActivity = employees.map((employee) => {
            const date = new Date(employee.createdAt || new Date())
            return {
              type: "employee",
              message: `New employee ${employee.name} added to the system`,
              time: formatRelativeTime(date),
              date: date,
              raw: employee,
            }
          })

          // Combine all activities and sort by date (newest first)
          const allActivity = [...attendanceActivity, ...expenseActivity, ...employeeActivity]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 5) // Get the 5 most recent activities

          setDashboardData({
            totalEmployees,
            presentToday,
            attendanceRate,
            monthlyExpenses,
            expenseChange,
            pendingApprovals,
            recentActivity: allActivity,
          })

          setLoading(false)
          setDataFetched(true)
        } catch (error) {
          console.error("Error fetching dashboard data:", error)
          toast({
            title: "Error",
            description: "Failed to load dashboard data",
            variant: "destructive",
          })
          setLoading(false)
          setDataFetched(true) // Mark as fetched even on error to prevent infinite retries
        }
      }

      fetchDashboardData()
    }
  }, [toast, dataFetched]) // Only depend on toast and dataFetched

  // Function to refresh dashboard data
  const refreshDashboard = () => {
    setDataFetched(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Button variant="outline" size="sm" onClick={refreshDashboard}>
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : dashboardData.totalEmployees}</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : dashboardData.presentToday}</div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "..." : `${dashboardData.attendanceRate}% attendance rate`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{loading ? "..." : dashboardData.monthlyExpenses.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">+{dashboardData.expenseChange}% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <BarChart2Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.pendingApprovals}</div>
                <p className="text-xs text-muted-foreground">Expense approvals pending</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200"></div>
                  </div>
                ) : dashboardData.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center">
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">{activity.message}</p>
                          <p className="text-sm text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">No recent activity</div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/attendance" className="block">
                  <div className="rounded-md bg-blue-50 p-3 hover:bg-blue-100 transition-colors cursor-pointer">
                    <div className="font-medium">Mark Attendance</div>
                    <div className="text-sm text-muted-foreground">Record today's attendance</div>
                  </div>
                </Link>
                <Link href="/expenses" className="block">
                  <div className="rounded-md bg-green-50 p-3 hover:bg-green-100 transition-colors cursor-pointer">
                    <div className="font-medium">Add Expense</div>
                    <div className="text-sm text-muted-foreground">Record a new expense</div>
                  </div>
                </Link>
                <Link href="/employees/add" className="block">
                  <div className="rounded-md bg-orange-50 p-3 hover:bg-orange-100 transition-colors cursor-pointer">
                    <div className="font-medium">Add Employee</div>
                    <div className="text-sm text-muted-foreground">Register a new staff member</div>
                  </div>
                </Link>
                <Link href="/reports" className="block">
                  <div className="rounded-md bg-purple-50 p-3 hover:bg-purple-100 transition-colors cursor-pointer">
                    <div className="font-medium">View Reports</div>
                    <div className="text-sm text-muted-foreground">Check attendance and expense reports</div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Detailed analytics will be available in the next update.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" asChild>
                  <Link href="/reports">View Current Reports</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/attendance">Check Attendance</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Access detailed reports about attendance and expenses.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" asChild>
                  <Link href="/reports">View All Reports</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/expenses">Manage Expenses</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
