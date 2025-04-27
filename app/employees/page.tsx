"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, Pencil, Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { employeeApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Employee {
  _id: string
  name: string
  position: string
  email?: string
  phone?: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await employeeApi.getAll()
      setEmployees(data)
    } catch (err) {
      console.error("Error fetching employees:", err)
      setError("Failed to load employees. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id)
      await employeeApi.delete(id)
      setEmployees((prev) => prev.filter((emp) => emp._id !== id))
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      })
    } catch (err) {
      console.error("Error deleting employee:", err)
      toast({
        title: "Error",
        description: "Failed to delete employee. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const confirmDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      handleDelete(id)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-muted-foreground">Manage staff members for NM DECOR.</p>
        </div>
        <Link href="/employees/add">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Employee List</h2>
        <p className="text-muted-foreground mb-6">View and manage all employees.</p>

        {isLoading ? (
          <div className="space-y-2">
            <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
            <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
            <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
          </div>
        ) : employees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Position</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Phone</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{employee.name}</td>
                    <td className="py-3 px-4">{employee.position}</td>
                    <td className="py-3 px-4">{employee.email}</td>
                    <td className="py-3 px-4">{employee.phone}</td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/employees/edit/${employee._id}`}>
                        <Button variant="outline" size="sm" className="mr-2">
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => confirmDelete(employee._id)}
                        disabled={isDeleting === employee._id}
                      >
                        {isDeleting === employee._id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No employees found. Add your first employee to get started.</p>
            <Link href="/employees/add">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
