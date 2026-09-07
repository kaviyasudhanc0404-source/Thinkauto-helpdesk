import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { UserPlus, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isTerminalTicketStatus } from "@/lib/ticketStatus";

const AssignTicket = () => {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const { toast } = useToast();

  const fetchData = async () => {
    const [ticketResponse, techResponse] = await Promise.all([api.getTickets(), api.getTechnicians()]);
    if (ticketResponse.success) setTickets(ticketResponse.data.tickets);
    if (techResponse.success) setTechnicians(techResponse.data.technicians);
  };

  useEffect(() => {
    fetchData();
    const timer = window.setInterval(fetchData, 10000);
    return () => window.clearInterval(timer);
  }, []);

  const unassigned = tickets.filter((ticket) => !ticket.assignedTo && !isTerminalTicketStatus(ticket));
  const activeLoad = (technicianId: string) =>
    tickets.filter((ticket) => ticket.assignedTo?._id === technicianId && !isTerminalTicketStatus(ticket)).length;

  const assignTicket = async (technicianId: string) => {
    if (!selectedTicket) return;
    try {
      await api.assignTicket(selectedTicket, technicianId);
      toast({ title: "Ticket assigned", description: "The technician queue has been updated." });
      setSelectedTicket(null);
      fetchData();
    } catch (error) {
      toast({ title: "Assignment failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="Assign Tickets">
      <div className="glass rounded-2xl p-4 mb-6 flex items-center gap-3 border-primary/20">
        <div className="gradient-primary rounded-xl p-2.5 shrink-0">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">AI Auto-Assignment</p>
          <p className="text-xs text-muted-foreground">Unassigned tickets and technician workload are pulled from the live helpdesk.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-foreground mb-3">Unassigned Tickets</h3>
          <div className="space-y-3">
            {unassigned.map((ticket, i) => (
              <motion.button key={ticket._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} onClick={() => setSelectedTicket(ticket._id)} className={`w-full text-left glass rounded-xl p-4 transition-all ${selectedTicket === ticket._id ? "border-primary/50 glow-orange" : "hover:border-primary/20"}`}>
                <p className="text-sm font-medium text-foreground">#{ticket.ticketNumber || ticket._id.slice(-6)} - {ticket.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{ticket.category} · {ticket.priority}</p>
              </motion.button>
            ))}
            {!unassigned.length && <div className="glass rounded-xl p-8 text-center text-muted-foreground">All active tickets are assigned.</div>}
          </div>
        </div>

        <div>
          <h3 className="font-display font-semibold text-foreground mb-3">Technicians</h3>
          <div className="space-y-3">
            {technicians.map((tech, i) => (
              <motion.button key={tech._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} disabled={!selectedTicket} onClick={() => assignTicket(tech._id)} className="w-full text-left glass rounded-xl p-4 hover:border-primary/20 transition-all disabled:opacity-50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
                  {(tech.name || tech.email).split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{tech.name || tech.email}</p>
                  <p className="text-xs text-muted-foreground">{tech.department || "General"} · {activeLoad(tech._id)} active tickets</p>
                </div>
                <UserPlus className="w-4 h-4 text-primary" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssignTicket;
