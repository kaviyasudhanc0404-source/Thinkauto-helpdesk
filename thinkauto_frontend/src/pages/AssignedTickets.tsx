import DashboardLayout from "@/components/DashboardLayout";
import TicketCard from "@/components/TicketCard";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { toTicketCardStatus } from "@/lib/ticketStatus";

const AssignedTickets = () => {
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
        // Filter only assigned tickets (not null assignedTo)
        const assignedTickets = response.data.tickets.filter(t => t.assignedTo);
        setTickets(assignedTickets);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load assigned tickets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = tickets.filter((t) => 
    t.title?.toLowerCase().includes(search.toLowerCase()) || 
    t.description?.toLowerCase().includes(search.toLowerCase()) ||
    t.ticketNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Assigned Tickets">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Search assigned tickets..." 
          className="w-full bg-secondary rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50" 
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket, i) => (
            <motion.div key={ticket._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <TicketCard 
                id={ticket.ticketNumber}
                title={ticket.title}
                description={ticket.description}
                status={toTicketCardStatus(ticket)}
                priority={ticket.priority.toLowerCase()}
                slaTime={ticket.sla?.responseDeadline ? new Date(ticket.sla.responseDeadline).toLocaleString() : ''}
                assignee="You"
                createdAt={new Date(ticket.createdAt).toLocaleString()}
              />
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-12">
              {tickets.length === 0 ? "No tickets assigned to you yet." : "No tickets match your search."}
            </p>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AssignedTickets;
