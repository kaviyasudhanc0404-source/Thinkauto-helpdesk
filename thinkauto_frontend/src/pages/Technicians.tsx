import { FormEvent, useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ClipboardList,
  Mail,
  Phone,
  Power,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatRelativeTime, getSlaInfo } from "@/lib/adminMetrics";
import { getEffectiveTicketStatus, isResolvedStatus, isUnsolvedStatus } from "@/lib/ticketStatus";

const emptyForm = {
  name: "",
  username: "",
  email: "",
  password: "",
  department: "",
  phoneNumber: "",
};

const activeStatuses = ["Open", "In Progress", "On Hold"];

const isSolved = (ticket) => isResolvedStatus(ticket);
const isUnsolved = (ticket) => isUnsolvedStatus(ticket);
const isActiveTask = (ticket) => activeStatuses.includes(getEffectiveTicketStatus(ticket));

const Technicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState<"all" | "solved" | "unsolved">("all");
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const fetchData = async () => {
    const [technicianResponse, ticketResponse] = await Promise.all([
      api.getUsers({ role: "technician" }),
      api.getTickets(),
    ]);

    if (technicianResponse.success) setTechnicians(technicianResponse.data.users);
    if (ticketResponse.success) setTickets(ticketResponse.data.tickets);
  };

  useEffect(() => {
    fetchData();
    const timer = window.setInterval(fetchData, 10000);
    return () => window.clearInterval(timer);
  }, []);

  const technicianRows = useMemo(
    () =>
      technicians
        .map((technician) => {
          const assignedTickets = tickets.filter((ticket) => ticket.assignedTo?._id === technician._id);
          const activeTasks = assignedTickets.filter(isActiveTask);
          const resolvedTasks = assignedTickets.filter(isSolved);
          const unsolvedTasks = assignedTickets.filter(isUnsolved);
          const atRiskTasks = activeTasks.filter((ticket) => getSlaInfo(ticket).risk !== "safe");

          return {
            ...technician,
            assignedTickets,
            activeTasks,
            resolvedTasks,
            unsolvedTasks,
            atRiskTasks,
          };
        })
        .filter((technician) =>
          `${technician.name} ${technician.username} ${technician.email} ${technician.department || ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
        ),
    [technicians, tickets, search]
  );

  const submitTechnician = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api.createUser({ ...form, role: "technician" });
      toast({ title: "Technician added", description: "The technician can now receive assigned tickets." });
      setForm(emptyForm);
      setShowForm(false);
      fetchData();
    } catch (error) {
      toast({ title: "Could not add technician", description: error.message, variant: "destructive" });
    }
  };

  const toggleActive = async (technician) => {
    try {
      await api.updateUser(technician._id, { isActive: !technician.isActive });
      toast({
        title: "Technician updated",
        description: `${technician.name || technician.username} is now ${technician.isActive ? "inactive" : "active"}.`,
      });
      fetchData();
    } catch (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    }
  };

  const deleteTechnician = async (technician) => {
    if (!window.confirm(`Delete ${technician.name || technician.username}?`)) return;
    try {
      await api.deleteUser(technician._id);
      toast({ title: "Technician deleted", description: "The technician account was removed." });
      fetchData();
    } catch (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    }
  };

  const updateTaskStatus = async (ticketId: string, status: string) => {
    try {
      await api.updateTicket(ticketId, { status });
      toast({ title: "Task updated", description: `Status changed to ${status}.` });
      fetchData();
    } catch (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    }
  };

  const visibleTasks = (technician) =>
    technician.assignedTickets.filter((ticket) => {
      if (taskFilter === "solved") return isSolved(ticket);
      if (taskFilter === "unsolved") return isUnsolved(ticket);
      return true;
    });

  return (
    <DashboardLayout title="Technician Management">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search technicians..."
            className="w-full bg-secondary rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button onClick={fetchData} className="glass flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm text-foreground hover:border-primary/30 sm:w-auto">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
        <button onClick={() => setShowForm((value) => !value)} className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground gradient-primary sm:w-auto">
          <UserPlus className="w-4 h-4" /> Add Technician
        </button>
      </div>

      {showForm && (
        <form onSubmit={submitTechnician} className="glass rounded-2xl p-5 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            ["name", "Full name"],
            ["username", "Username"],
            ["email", "Email"],
            ["password", "Temporary password"],
            ["department", "Speciality / department"],
            ["phoneNumber", "Phone number"],
          ].map(([key, label]) => (
            <input
              key={key}
              required={["username", "email", "password"].includes(key)}
              type={key === "password" ? "password" : "text"}
              value={form[key]}
              onChange={(event) => setForm({ ...form, [key]: event.target.value })}
              placeholder={label}
              className="bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
            />
          ))}
          <button className="gradient-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-medium md:col-span-2">Create technician</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="glass rounded-2xl p-5">
          <p className="text-2xl font-display font-bold text-foreground">{technicians.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Technicians</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-2xl font-display font-bold text-foreground">{tickets.filter((ticket) => ticket.assignedTo && isActiveTask(ticket)).length}</p>
          <p className="text-sm text-muted-foreground mt-1">Active tasks</p>
        </div>
      </div>

      <div className="space-y-5">
        {technicianRows.map((technician, index) => {
          const isOpen = selectedTechnicianId === technician._id;
          const tasks = visibleTasks(technician);

          return (
            <motion.section key={technician._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="glass rounded-2xl p-5">
              <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
                <div className="flex items-start gap-4 lg:w-80 shrink-0">
                  <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-lg font-bold text-primary-foreground shrink-0">
                    {(technician.name || technician.username).split(" ").map((name) => name[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-display font-semibold text-foreground">{technician.name || technician.username}</p>
                    <p className="text-xs text-muted-foreground">{technician.department || "General support"}</p>
                    <p className="mt-2 flex min-w-0 items-start gap-1 break-all text-xs text-muted-foreground"><Mail className="mt-0.5 h-3 w-3 shrink-0" /> {technician.email}</p>
                    {technician.phoneNumber && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Phone className="w-3 h-3" /> {technician.phoneNumber}</p>}
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${technician.isActive ? "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]" : "bg-secondary text-muted-foreground"}`}>
                        {technician.isActive ? "active" : "inactive"}
                      </span>
                      <button onClick={() => toggleActive(technician)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground" aria-label="Toggle technician status">
                        <Power className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteTechnician(technician)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive" aria-label="Delete technician">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="bg-secondary/40 rounded-xl p-3">
                      <p className="text-lg font-bold text-foreground">{technician.activeTasks.length}</p>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                    <div className="bg-secondary/40 rounded-xl p-3">
                      <p className="text-lg font-bold text-foreground">{technician.resolvedTasks.length}</p>
                      <p className="text-xs text-muted-foreground">Resolved</p>
                    </div>
                    <div className="bg-secondary/40 rounded-xl p-3">
                      <p className="text-lg font-bold text-foreground">{technician.atRiskTasks.length}</p>
                      <p className="text-xs text-muted-foreground">SLA risk</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTechnicianId(isOpen ? null : technician._id);
                      setTaskFilter("all");
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground gradient-primary sm:w-auto"
                  >
                    <ClipboardList className="w-4 h-4" />
                    {isOpen ? "Hide Tasks" : "View Tasks"}
                  </button>

                  {isOpen && (
                    <div className="mt-4 border-t border-border pt-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {[
                          ["all", `All tickets (${technician.assignedTickets.length})`],
                          ["solved", `Solved (${technician.resolvedTasks.length})`],
                          ["unsolved", `Unsolved (${technician.unsolvedTasks.length})`],
                        ].map(([value, label]) => (
                          <button
                            key={value}
                            onClick={() => setTaskFilter(value as "all" | "solved" | "unsolved")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              taskFilter === value
                                ? "gradient-primary text-primary-foreground"
                                : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-2">
                        {tasks.map((ticket) => (
                          <div key={ticket._id} className="bg-secondary/30 rounded-xl p-3 flex flex-col md:flex-row md:items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">#{ticket.ticketNumber || ticket._id.slice(-6)} - {ticket.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {ticket.priority} · {getEffectiveTicketStatus(ticket)} · {getSlaInfo(ticket).label} · {formatRelativeTime(ticket.createdAt)}
                              </p>
                            </div>
                            <div className="flex w-full items-center gap-2 md:w-auto">
                              {isActiveTask(ticket) && getEffectiveTicketStatus(ticket) !== "On Hold" && (
                                <button onClick={() => updateTaskStatus(ticket._id, "On Hold")} className="flex w-full items-center justify-center gap-1 rounded-lg bg-[hsl(var(--warning))]/15 px-3 py-2 text-xs font-medium text-[hsl(var(--warning))] md:w-auto">
                                  <AlertTriangle className="w-3 h-3" /> Hold
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {!tasks.length && <p className="text-sm text-muted-foreground">No tasks in this view.</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default Technicians;
