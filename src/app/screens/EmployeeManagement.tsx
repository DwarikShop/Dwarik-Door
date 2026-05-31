"use client";

import { useState } from "react";
import { BottomNav } from "../components/BottomNav";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useEmployees, type SafeEmployee } from "../hooks/useEmployees";
import { UserPlus, X, KeyRound, Phone, User, ChevronRight } from "lucide-react";
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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const ROLE_STYLES: Record<string, { bg: string; text: string }> = {
  owner: { bg: "bg-accent/15", text: "text-accent" },
  employee: { bg: "bg-info/10", text: "text-info" },
};

export function EmployeeManagement() {
  const {
    employees,
    isLoading,
    isSubmitting,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    changePassword,
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

  // Reset password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);

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
    setShowResetForm(false);
    setNewPassword("");
    setConfirmPassword("");
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

  const handleResetPassword = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }
    const ok = await changePassword(editTarget!.id, { newPassword });
    if (ok) {
      toast.success(`Password reset for ${editTarget!.name}`);
      setShowResetForm(false);
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error("Failed to reset password");
    }
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-[#4E342E] dark:bg-[#2A1510] border-b border-[#DAB668]/40 text-white px-6 py-6 sticky top-0 z-40 shadow-[0_4px_25px_rgba(78,52,46,0.25)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all duration-300">
          <div className="max-w-lg mx-auto">
            <div className="h-7 w-32 bg-white/20 rounded" />
          </div>
        </header>
        <div className="max-w-lg mx-auto px-4 py-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl h-20 animate-pulse"
            />
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const owners = employees.filter((e) => e.role === "owner");
  const staff = employees.filter((e) => e.role === "employee");

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-[#4E342E] dark:bg-[#2A1510] border-b border-[#DAB668]/40 text-white px-6 pt-8 pb-5 sticky top-0 z-40 shadow-[0_4px_25px_rgba(78,52,46,0.25)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] transition-all duration-300">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Team</h1>
            <p className="text-[10px] text-neutral-400/80 mt-1">
              {employees.length} member{employees.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl active:scale-95 transition-transform border border-white/15 shadow-sm"
          >
            <UserPlus size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <User size={28} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">No team members yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tap + to add your first employee
            </p>
          </div>
        ) : (
          <>
            {/* Owners */}
            {owners.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  Owners
                </h2>
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
                  {owners.map((emp) => {
                    const rs = ROLE_STYLES[emp.role];
                    return (
                      <button
                        key={emp.id}
                        onClick={() => openEdit(emp)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/30 active:bg-secondary/50 transition-colors"
                      >
                        {/* Avatar */}
                        <div className="w-11 h-11 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-accent">
                            {getInitials(emp.name)}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground truncate leading-snug">
                              {emp.name}
                            </p>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${rs.bg} ${rs.text}`}>
                              {emp.role}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Phone size={11} className="text-muted-foreground" />
                            <a
                              href={`tel:${emp.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-muted-foreground hover:text-accent hover:underline cursor-pointer transition-colors font-mono"
                            >
                              {emp.phone}
                            </a>
                          </div>
                        </div>

                        <ChevronRight size={14} className="text-muted-foreground/40 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Employees */}
            {staff.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  Employees
                </h2>
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
                  {staff.map((emp) => {
                    const rs = ROLE_STYLES[emp.role];
                    return (
                      <button
                        key={emp.id}
                        onClick={() => openEdit(emp)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/30 active:bg-secondary/50 transition-colors"
                      >
                        {/* Avatar */}
                        <div className="w-11 h-11 rounded-full bg-info/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-info">
                            {getInitials(emp.name)}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground truncate leading-snug">
                              {emp.name}
                            </p>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${rs.bg} ${rs.text}`}>
                              {emp.role}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Phone size={11} className="text-muted-foreground" />
                            <a
                              href={`tel:${emp.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-muted-foreground hover:text-accent hover:underline cursor-pointer transition-colors font-mono"
                            >
                              {emp.phone}
                            </a>
                          </div>
                        </div>

                        <ChevronRight size={14} className="text-muted-foreground/40 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
          </>
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

              <div className="border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => { setShowResetForm((v) => !v); setNewPassword(""); setConfirmPassword(""); }}
                  className="w-full flex items-center justify-between py-1"
                >
                  <div className="flex items-center gap-2">
                    <KeyRound size={16} className="text-muted-foreground" />
                    <span className="text-sm font-medium">Reset Password</span>
                  </div>
                  <span className="text-xs text-accent font-semibold">{showResetForm ? "Cancel" : "Reset"}</span>
                </button>

                {showResetForm && (
                  <div className="space-y-3 mt-3">
                    <Input
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      className="w-full"
                      disabled={isSubmitting}
                      onClick={handleResetPassword}
                    >
                      {isSubmitting ? "Saving…" : "Confirm Reset"}
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

<BottomNav />
    </div>
  );
}
