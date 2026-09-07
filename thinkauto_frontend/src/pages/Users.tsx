import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { Search, UserPlus, Shield, Wrench, User, Trash2, Power } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const roleIcons: Record<string, typeof User> = { admin: Shield, technician: Wrench, employee: User };

const Users = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const { toast } = useToast();

  const fetchUsers = async () => {
    const response = await api.getUsers();
    if (response.success) setUsers(response.data.users);
  };

  useEffect(() => {
    fetchUsers();
    const timer = window.setInterval(fetchUsers, 10000);
    return () => window.clearInterval(timer);
  }, []);

  const filtered = users.filter((u) => `${u.name} ${u.email} ${u.username} ${u.role}`.toLowerCase().includes(search.toLowerCase()));

  const toggleActive = async (user) => {
    try {
      await api.updateUser(user._id, { isActive: !user.isActive });
      toast({ title: "User updated", description: `${user.name || user.username} is now ${user.isActive ? "inactive" : "active"}.` });
      fetchUsers();
    } catch (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.name || user.username}?`)) return;
    try {
      await api.deleteUser(user._id);
      toast({ title: "User deleted", description: "The account was removed." });
      fetchUsers();
    } catch (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="User Management">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="w-full bg-secondary rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <button onClick={() => window.location.assign("/admin/employees")} className="gradient-primary text-primary-foreground text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map((user, i) => {
          const RoleIcon = roleIcons[user.role] || User;
          return (
            <motion.div key={user._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
                {(user.name || user.username).split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{user.name || user.username}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-muted-foreground capitalize"><RoleIcon className="w-3 h-3" /> {user.role}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive ? "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]" : "bg-secondary text-muted-foreground"}`}>
                  {user.isActive ? "active" : "inactive"}
                </span>
                <button onClick={() => toggleActive(user)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground" aria-label="Toggle user status">
                  <Power className="w-4 h-4" />
                </button>
                {user.role !== "admin" && (
                  <button onClick={() => deleteUser(user)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive" aria-label="Delete user">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default Users;
