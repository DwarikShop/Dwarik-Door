import { useState } from "react";
import { BottomNav } from "../components/BottomNav";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { employees } from "../data/mockData";
import { UserPlus, X, Edit2 } from "lucide-react";
import { toast } from "sonner";

export function EmployeeManagement() {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"owner" | "employee">("employee");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Employee added successfully!");
    setShowModal(false);
    setName("");
    setPhone("");
    setPassword("");
    setRole("employee");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground px-6 py-6 sticky top-0 z-40 shadow-md">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Employees</h1>
          <button
            onClick={() => setShowModal(true)}
            className="p-2 bg-accent text-accent-foreground rounded-full hover:opacity-90 transition-opacity"
          >
            <UserPlus size={24} />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-6 space-y-4">
        {employees.map((employee) => (
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
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <Edit2 size={20} className="text-muted-foreground" />
              </button>
            </div>
          </Card>
        ))}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Add Employee</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Full Name</label>
                <Input
                  placeholder="Enter employee name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Password</label>
                <Input
                  type="password"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Role</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("employee")}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                      role === "employee"
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("owner")}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                      role === "owner"
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    Owner
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Add Employee
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
