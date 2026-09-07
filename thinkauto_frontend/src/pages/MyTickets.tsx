import DashboardLayout from "@/components/DashboardLayout";
import TicketCard from "@/components/TicketCard";
import { motion } from "framer-motion";
import { Search, Filter, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { TICKET_FILTERS, statusFilterMatches, toTicketCardStatus } from "@/lib/ticketStatus";

const filters = TICKET_FILTERS;

const MyTickets = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.getTickets();
      if (response.success) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load tickets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = tickets.filter((t) => {
    const matchFilter = statusFilterMatches(t, activeFilter);
    const matchSearch = t.title?.toLowerCase().includes(search.toLowerCase()) || 
                       t.description?.toLowerCase().includes(search.toLowerCase()) ||
                       t.ticketNumber?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <DashboardLayout title="My Tickets">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="w-full bg-secondary rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:pb-0">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                activeFilter === f ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ticket, i) => (
            <motion.div key={ticket._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <TicketCard 
                id={ticket.ticketNumber}
                title={ticket.title}
                description={ticket.description}
                status={toTicketCardStatus(ticket)}
                priority={ticket.priority.toLowerCase()}
                slaTime={ticket.sla?.responseDeadline ? new Date(ticket.sla.responseDeadline).toLocaleString() : ''}
                createdAt={new Date(ticket.createdAt).toLocaleString()}
              />
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <p className="text-muted-foreground text-sm col-span-full text-center py-12">
              {tickets.length === 0 ? "No tickets found. Create your first ticket!" : "No tickets match your filters."}
            </p>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyTickets;
