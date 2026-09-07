import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import TicketCard from "@/components/TicketCard";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { Loader2, RefreshCw, Search } from "lucide-react";
import { formatRelativeTime, getSlaInfo, priorityToCardPriority } from "@/lib/adminMetrics";
import { toTicketCardStatus } from "@/lib/ticketStatus";
import { useToast } from "@/hooks/use-toast";

const AllTickets = () => {
  const [search, setSearch] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const fetchTickets = async () => {
    try {
      setError("");
      const response = await api.getTickets();
      if (response.success) {
        setTickets(response.data.tickets || []);
      }
    } catch (fetchError) {
      setTickets([]);
      setError(fetchError.message || "Unable to load real tickets from the backend.");
      toast({ title: "Tickets unavailable", description: fetchError.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const timer = window.setInterval(fetchTickets, 10000);
    return () => window.clearInterval(timer);
  }, []);

  const filtered = tickets.filter((ticket) => {
    const value = `${ticket.title} ${ticket.description} ${ticket.ticketNumber} ${ticket.createdBy?.name || ""}`.toLowerCase();
    return value.includes(search.toLowerCase());
  });

  return (
    <DashboardLayout title="All Tickets">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search all tickets..." className="w-full bg-secondary rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <button onClick={fetchTickets} className="glass flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm text-foreground hover:border-primary/30 sm:w-auto">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>
      {loading ? (
        <div className="glass rounded-2xl p-10 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="font-display font-semibold text-foreground">No backend tickets loaded</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="font-display font-semibold text-foreground">No real tickets found</p>
          <p className="text-sm text-muted-foreground mt-2">Tickets will appear here only after they are created in the helpdesk backend.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ticket, i) => (
            <motion.div key={ticket._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="h-full">
              <TicketCard
                id={ticket.ticketNumber || ticket._id.slice(-6)}
                title={ticket.title}
                description={ticket.description}
                status={toTicketCardStatus(ticket)}
                priority={priorityToCardPriority(ticket.priority)}
                slaTime={getSlaInfo(ticket).label}
                assignee={ticket.assignedTo?.name}
                createdAt={formatRelativeTime(ticket.createdAt)}
                className="h-64"
              />
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AllTickets;
