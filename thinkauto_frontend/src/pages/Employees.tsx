import { FormEvent, useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { Mail, Phone, Search, UserPlus, Power, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const emptyForm = {
  name: "",
  username: "",
  email: "",
  password: "",
  department: "",
  phoneNumber: "",
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    const response = await api.getUsers({ role: "employee" });
    if (response.success) setEmployees(response.data.users);
  };

  useEffect(() => {
    fetchEmployees();
    const timer = window.setInterval(fetchEmployees, 10000);
    return () => window.clearInterval(timer);
  }, []);

  const filtered = employees.filter((employee) =>
    `${employee.name} ${employee.username} ${employee.email} ${employee.department || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const submitEmployee = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api.createUser({ ...form, role: "employee" });
      toast({ title: "Employee added", description: "The employee can now sign in and raise tickets." });
      setForm(emptyForm);
      setShowForm(false);
      fetchEmployees();
    } catch (error) {
      toast({ title: "Could not add employee", description: error.message, variant: "destructive" });
    }
  };

  const toggleActive = async (employee) => {
    try {
      await api.updateUser(employee._id, { isActive: !employee.isActive });
      fetchEmployees();
    } catch (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    }
  };

  const deleteEmployee = async (employee) => {
    if (!window.confirm(`Delete ${employee.name || employee.username}?`)) return;
    try {
      await api.deleteUser(employee._id);
      fetchEmployees();
    } catch (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="Employee Management">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees..." className="w-full bg-secondary rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <button onClick={() => setShowForm((value) => !value)} className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground gradient-primary sm:w-auto">
          <UserPlus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      {showForm && (
        <form onSubmit={submitEmployee} className="glass rounded-2xl p-5 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            ["name", "Full name"],
            ["username", "Username"],
            ["email", "Email"],
            ["password", "Temporary password"],
            ["department", "Department"],
            ["phoneNumber", "Phone number"],
          ].map(([key, label]) => (
            <input key={key} required={["username", "email", "password"].includes(key)} type={key === "password" ? "password" : "text"} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={label} className="bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50" />
          ))}
          <button className="gradient-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-medium md:col-span-2">Create employee</button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((employee, i) => (
          <motion.div key={employee._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-lg font-bold text-primary-foreground shrink-0">
                {(employee.name || employee.username).split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="break-words font-display font-semibold text-foreground">{employee.name || employee.username}</p>
                <p className="text-xs text-muted-foreground">{employee.department || "No department"}</p>
                <p className="mt-2 flex min-w-0 items-start gap-1 break-all text-xs text-muted-foreground"><Mail className="mt-0.5 h-3 w-3 shrink-0" /> {employee.email}</p>
                {employee.phoneNumber && <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3 shrink-0" /> {employee.phoneNumber}</p>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleActive(employee)} className={`p-2 rounded-lg ${employee.isActive ? "text-[hsl(var(--success))]" : "text-muted-foreground"} hover:bg-secondary`} aria-label="Toggle employee status">
                  <Power className="w-4 h-4" />
                </button>
                <button onClick={() => deleteEmployee(employee)} className="p-2 rounded-lg text-destructive hover:bg-destructive/10" aria-label="Delete employee">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Employees;
