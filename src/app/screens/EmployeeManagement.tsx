"use client";

import { useState } from "react";
import { BottomNav } from "../components/BottomNav";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useEmployees, type SafeEmployee } from "../hooks/useEmployees";
import { UserPlus, X, Edit2 } from "lucide-react";
import { toast } from "sonner";

// ── Add modal state ───────────────────────────────────────────────────────────

interface AddForm {
  name: string;
  phone: string;
  password: string;
  role: "owner" | "employee";
}

const EMPTY_ADD: AddForm = {
  name: "",
  phone: "",
  password: "",
  role: "employee",
};

// ── Edit modal state ──────────────────────────────────────────────────────────

interface EditForm {
  name: string;
  phone: string;
  role: "owner" | "employee";
}

export function EmployeeManagement() {
  const {
    employees,
    isLoading,
    isSubmitting,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployees();

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<AddForm>(EMPTY_ADD);

  // Edit modal
  const [editTarget, setEditTarget] = useState<SafeEmployee | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: "",
    phone: "",
    role: "employee",
  });

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addEmployee(addForm);
    if (result) {
      toast.success(`${result.name} added successfully`);
      setShowAddModal(false);
      setAddForm(EMPTY_ADD);
    } else {
      toast.error("Failed to add employee. Phone may already be in use.");
    }
  };

  const openEdit = (emp: SafeEmployee) => {
    setEditTarget(emp);
    setEditForm({ name: emp.name, phone: emp.phone, role: emp.role });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    const result = await updateEmployee(editTarget.id, editForm);
    if (result) {
      toast.success("Employee updated successfully");
      setEditTarget(null);
    } else {
      toast.error("Failed to update employee. Phone may already be in use.");
    }
  };

  const handleDelete = async (emp: SafeEmployee) => {
    const ok = await deleteEmployee(emp.id);
    if (ok) toast.success(`${emp.name} removed`);
    else toast.error("Failed to remove employee");
    setEditTarget(null);
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-primary text-primary-foreground px-6 py-6 sticky top-0 z-40 shadow-md">
          <div className="max-w-lg mx-auto">
            <div className="h-7 w-32 bg-primary-foreground/20 rounded" />
          </div>
        </header>
        <div className="max-w-lg mx-auto px-6 py-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl h-24 animate-pulse"
            />
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground px-6 py-6 sticky top-0 z-40 shadow-md">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Employees</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-accent text-accent-foreground rounded-full hover:opacity-90 transition-opacity"
          >
            <UserPlus size={24} />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-6 space-y-4">
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground text-sm">No employees yet</p>
          </div>
        ) : (
          employees.map((employee) => (
            <Card key={employee.id} className="p-4 gap-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{employee.name}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        employee.role === "owner"
                          ? "bg-accent/20 text-accent"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {employee.role}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-semibold text-foreground">ID:</span>{" "}
                      {employee.id}
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">
                        Phone:
                      </span>{" "}
                      {employee.phone}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => openEdit(employee)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <Edit2 size={20} className="text-muted-foreground" />
                </button>
              </div>
            </Card>
          ))
        )}
      </main>

      {/* ── Add Employee Modal ─────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Add Employee</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddForm(EMPTY_ADD);
                }}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Full Name</label>
                <Input
                  placeholder="Enter employee name"
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={addForm.phone}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Password</label>
                <Input
                  type="password"
                  placeholder="Create password"
                  value={addForm.password}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, password: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Role</label>
                <div className="flex gap-3">
                  {(["employee", "owner"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAddForm((f) => ({ ...f, role: r }))}
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all capitalize ${
                        addForm.role === r
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowAddModal(false);
                    setAddForm(EMPTY_ADD);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding…" : "Add Employee"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Employee Modal ────────────────────────────────────────────── */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Edit Employee</h2>
              <button
                onClick={() => setEditTarget(null)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Full Name</label>
                <Input
                  placeholder="Employee name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="Phone number"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Role</label>
                <div className="flex gap-3">
                  {(["employee", "owner"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setEditForm((f) => ({ ...f, role: r }))}
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all capitalize ${
                        editForm.role === r
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1"
                  disabled={isSubmitting}
                  onClick={() => handleDelete(editTarget)}
                >
                  {isSubmitting ? "…" : "Remove"}
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
