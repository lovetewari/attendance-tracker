"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getEmployeesAction } from "@/lib/attendance-actions"
import { getExpensesByDateAction, addExpenseAction, deleteExpenseAction } from "@/lib/expense-actions"
import type { Employee, Expense } from "@/lib/db"

const EXPENSE_CATEGORIES = ["Travel", "Meals", "Office Supplies", "Equipment", "Training", "Other"]

export function ExpenseForm() {
  const { toast } = useToast()
  const [date, setDate] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null)
  const [amount, setAmount] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [category, setCategory] = useState<string>("Travel")
  const [expenseDates, setExpenseDates] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Load employees and expense data
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)

        // Load employees
        const employeesData = await getEmployeesAction()
        setEmployees(employeesData)

        // Load expenses for selected date
        await loadExpensesForDate(selectedDate)

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  // Load expenses for a specific date
  const loadExpensesForDate = async (date: string) => {
    try {
      const records = await getExpensesByDateAction(date)
      setExpenses(records)

      // Update expense dates set
      const dates = new Set(expenseDates)
      if (records.length > 0) {
        dates.add(date)
      }
      setExpenseDates(dates)
    } catch (error) {
      console.error("Error loading expenses:", error)
      toast({
        title: "Error",
        description: "Failed to load expense data. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Fix the date selection issue by ensuring we use local dates without timezone shifts
  const handleDateSelect = async (date: Date | undefined) => {
    if (date) {
      setDate(date)
      // Fix: Use local date string to avoid timezone issues
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      const dateString = `${year}-${month}-${day}`
      setSelectedDate(dateString)
      await loadExpensesForDate(dateString)
    }
  }

  const addExpense = async () => {
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
      setIsAdding(true)

      const newExpense = {
        employeeId: selectedEmployee,
        date: selectedDate,
        amount: Number(amount),
        description,
        category,
      }

      const addedExpense = await addExpenseAction(newExpense)

      // Update local state
      setExpenses((prev) => [...prev, addedExpense])

      // Update expense dates
      setExpenseDates((prev) => new Set(prev).add(selectedDate))

      // Reset form
      setAmount("")
      setDescription("")
      setCategory("Travel")
      setSelectedEmployee(null)

      toast({
        title: "Expense Added",
        description: `Expense of $${amount} has been added.`,
      })

      setIsAdding(false)
    } catch (error) {
      console.error("Error adding expense:", error)
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      })
      setIsAdding(false)
    }
  }

  const deleteExpense = async (id: string) => {
    if (!id) {
      toast({
        title: "Error",
        description: "Invalid expense ID",
        variant: "destructive",
      })
      return
    }

    try {
      setIsDeleting(id)
      console.log("Deleting expense with ID:", id)

      const response = await deleteExpenseAction(id)

      if (response.success) {
        // Update local state
        setExpenses((prev) => prev.filter((expense) => expense.id !== id))

        toast({
          title: "Expense Deleted",
          description: "The expense has been deleted.",
        })
      } else {
        throw new Error(response.error || "Failed to delete expense")
      }
    } catch (error) {
      console.error("Error deleting expense:", error)
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  // Format date for display
  const formattedDate = new Date(selectedDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const shortFormattedDate = new Date(selectedDate).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  })

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading expense data...</div>
  }

  return (
    <div className="grid gap-6 md:grid-cols-[350px_1fr]">
      <div className="space-y-6">
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>Select Date</CardTitle>
            <CardDescription>Choose a date to view or add expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              className="rounded-md"
              modifiers={{
                hasExpense: (date) => {
                  const dateString = date.toISOString().split("T")[0]
                  return expenseDates.has(dateString)
                },
              }}
              modifiersClassNames={{
                hasExpense: "bg-primary/10 font-bold text-primary",
              }}
            />
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>Add Expense</CardTitle>
            <CardDescription>Date: {shortFormattedDate}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Employee</Label>
                <Select
                  value={selectedEmployee?.toString() || ""}
                  onValueChange={(value) => setSelectedEmployee(Number(value))}
                >
                  <SelectTrigger id="employee">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
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

              <Button onClick={addExpense} disabled={isAdding} className="w-full">
                {isAdding ? (
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
      </div>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Expenses for {formattedDate}</CardTitle>
          <CardDescription>
            {expenses.length === 0 ? "No expenses recorded for this date" : `${expenses.length} expense(s) recorded`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length > 0 ? (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div key={expense.id || expense._id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {expense.employeeName ||
                        employees.find((emp) => emp.id === expense.employeeId)?.name ||
                        "Unknown"}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="font-bold">${expense.amount.toFixed(2)}</div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteExpense(expense.id || expense._id)}
                        className="h-8 w-8 rounded-full"
                        disabled={isDeleting === (expense.id || expense._id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    <span className="inline-block rounded-full bg-secondary px-2 py-1 text-xs">{expense.category}</span>
                  </div>
                  <div className="mt-2 text-sm">{expense.description}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              No expenses recorded for this date
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
