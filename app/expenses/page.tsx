"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, RefreshCw } from "lucide-react"
import { employeeApi, expenseApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function ExpensesPage() {
  const { toast } = useToast()
  const [employees, setEmployees] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [totalExpenses, setTotalExpenses] = useState<number>(0)
  const [totalExpenseCount, setTotalExpenseCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Form state
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [category, setCategory] = useState<string>("Materials")
  const [description, setDescription] = useState<string>("")

  const EXPENSE_CATEGORIES = ["Materials", "Transportation", "Tools", "Office Supplies", "Meals", "Other"]

  // Format date to YYYY-MM-DD consistently
  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Get current month name and year
  const getCurrentMonthYear = () => {
    const date = new Date()
    return date.toLocaleString("default", { month: "long", year: "numeric" })
  }

  const fetchData = async () => {
    try {
      setIsLoading(true)
      // Fetch employees
      const employeesData = await employeeApi.getAll()
      setEmployees(employeesData)

      // Fetch today's expenses - use a consistent date format
      const today = new Date()
      const formattedDate = formatDate(today)
      console.log("Fetching expenses for date:", formattedDate)
      const expensesData = await expenseApi.getByDate(formattedDate)
      setExpenses(expensesData)

      // Fetch all expenses for the total
      const allExpenses = await expenseApi.getAll()
      const total = allExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
      setTotalExpenses(total)
      setTotalExpenseCount(allExpenses.length)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchData()
  }

  const handleAddExpense = async () => {
    if (!selectedEmployee) {
      toast({
        title: "Error",
        description: "Please select an employee",
        variant: "destructive",
      })
      return
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    if (!description) {
      toast({
        title: "Error",
        description: "Please enter a description",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const today = new Date()
      const formattedDate = formatDate(today)

      const newExpense = {
        employeeId: selectedEmployee,
        date: formattedDate,
        amount: Number(amount),
        description,
        category,
      }

      console.log("Adding new expense:", newExpense)
      const result = await expenseApi.create(newExpense)

      if (result) {
        // Reset form
        setSelectedEmployee("")
        setAmount("")
        setCategory("Materials")
        setDescription("")

        toast({
          title: "Success",
          description: "Expense added successfully",
        })

        // Refresh data
        await fetchData()
      }
    } catch (error) {
      console.error("Error adding expense:", error)
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!id) {
      console.error("Cannot delete expense: ID is undefined")
      toast({
        title: "Error",
        description: "Failed to delete expense. Invalid ID.",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("Deleting expense with ID:", id)
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete expense")
      }

      toast({
        title: "Success",
        description: "Expense deleted successfully",
      })

      // Refresh data
      await fetchData()
    } catch (error) {
      console.error("Error deleting expense:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete expense. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getEmployeeName = (id: number | string | undefined) => {
    if (!id) return "Unknown"

    // Find employee by either _id or id
    const employee = employees.find((emp) => {
      if (!emp) return false

      // Convert both to strings for comparison
      const empId = emp._id ? emp._id.toString() : emp.id ? emp.id.toString() : null
      const searchId = id.toString()

      return empId === searchId
    })

    return employee ? employee.name : "Unknown"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
        <p className="text-muted-foreground">Track and manage expenses for NM DECOR staff.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
            <CardDescription>Enter expense details for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger id="employee">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee._id || employee.id} value={(employee._id || employee.id).toString()}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter expense details"
                />
              </div>

              <Button onClick={handleAddExpense} disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  "Adding..."
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Expense
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Expenses</CardTitle>
              <CardDescription>
                {expenses.length === 0 ? "No expenses recorded for today" : `${expenses.length} expense(s) recorded`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : expenses.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  No expenses recorded for today
                </div>
              ) : (
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div key={expense.id || expense._id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{getEmployeeName(expense.employeeId)}</div>
                        <div className="flex items-center gap-2">
                          <div className="font-bold">₹{expense.amount.toFixed(2)}</div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteExpense(expense.id || expense._id)}
                            className="h-8 w-8 rounded-full"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        <span className="inline-block rounded-full bg-secondary px-2 py-1 text-xs">
                          {expense.category}
                        </span>
                      </div>
                      <div className="mt-2 text-sm">{expense.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Expenses</CardTitle>
              <CardDescription>{getCurrentMonthYear()}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <div className="space-y-2">
                  <div className="text-2xl font-bold">₹{totalExpenses.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">{totalExpenseCount} expense entries</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
