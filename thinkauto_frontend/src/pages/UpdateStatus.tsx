import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Search, Loader2, ShieldCheck, Clock, AlertCircle, CheckCircle2, Send } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { getEffectiveTicketStatus, normalizeTicketStatus } from "@/lib/ticketStatus";

const UpdateStatus = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [verifyingTicket, setVerifyingTicket] = useState(null);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchPendingTickets();
  }, []);

  const fetchPendingTickets = async () => {
    try {
      setLoading(true);
      const response = await api.getTickets();
      if (response.success) {
        const pending = response.data.tickets.filter((ticket) => {
          const effectiveStatus = getEffectiveTicketStatus(ticket);
          return ticket.assignedTo && (effectiveStatus === 'Open' || effectiveStatus === 'In Progress');
        });
        setTickets(pending);
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

  const handleRequestVerification = async (ticket) => {
    try {
      setSendingOtp(true);
      const response = await api.requestVerification(ticket._id);
      
      if (response.success) {
        toast({
          title: "OTP Sent!",
          description: `Verification code sent to ${ticket.createdBy.email}. Ask employee for the code.`,
        });
        // Open dialog immediately for technician to enter OTP
        setVerifyingTicket(ticket);
        setOtpDialogOpen(true);
        fetchPendingTickets();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive"
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    try {
      setVerifyingOtp(true);
      const response = await api.verifyTicketCompletion(verifyingTicket._id, otp);
      
      if (response.success) {
        toast({
          title: "✅ Ticket Completed!",
          description: `Ticket ${verifyingTicket.ticketNumber} has been marked as resolved`,
        });
        setOtpDialogOpen(false);
        setOtp("");
        setVerifyingTicket(null);
        fetchPendingTickets();
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired OTP",
        variant: "destructive"
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const filtered = tickets.filter((t) =>
    t.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusColor = (status) => {
    switch (normalizeTicketStatus(status)) {
      case 'Open': return 'bg-blue-500/10 text-blue-500';
      case 'In Progress': return 'bg-orange-500/10 text-orange-500';
      case 'Resolved': return 'bg-green-500/10 text-green-500';
      case 'Unsolved': return 'bg-red-500/10 text-red-500';
      case 'Expired': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <DashboardLayout title="Update Ticket Status">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Pending Tickets</h2>
            <p className="text-sm text-muted-foreground">Complete your assigned tickets with OTP verification</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets by ID, title, or description..."
            className="w-full bg-secondary rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ticket, i) => (
              <motion.div
                key={ticket._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="glass p-4 hover-lift border-border/50 sm:p-5">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">{ticket.ticketNumber}</p>
                      <h3 className="break-words font-semibold text-foreground">{ticket.title}</h3>
                    </div>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {ticket.description}
                  </p>

                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge className={getStatusColor(getEffectiveTicketStatus(ticket))}>
                      {getEffectiveTicketStatus(ticket)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {ticket.category}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground mb-4">
                    <p>Created: {new Date(ticket.createdAt).toLocaleString()}</p>
                    <p>By: {ticket.createdBy?.name}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        // If OTP already sent, just open dialog. Otherwise request OTP.
                        if (ticket.verification?.otp) {
                          setVerifyingTicket(ticket);
                          setOtpDialogOpen(true);
                        } else {
                          handleRequestVerification(ticket);
                        }
                      }}
                      disabled={sendingOtp}
                      className="flex-1 gradient-primary text-primary-foreground"
                    >
                      {sendingOtp ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending OTP...
                        </>
                      ) : ticket.verification?.otp ? (
                        <>
                          <ShieldCheck className="w-4 h-4 mr-2" />
                          Enter OTP to Complete
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 mr-2" />
                          Request Verification
                        </>
                      )}
                    </Button>
                  </div>

                  {ticket.verification?.otp && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-green-600 bg-green-500/10 p-2 rounded-lg">
                      <Clock className="w-3 h-3" />
                      <span>OTP sent to employee</span>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {tickets.length === 0 
                    ? "No pending tickets found. Great job!" 
                    : "No tickets match your search."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* OTP Verification Dialog */}
      <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Verify Ticket Completion
            </DialogTitle>
            <DialogDescription>
              Enter the 6-digit OTP sent to the employee's email to complete this ticket.
            </DialogDescription>
          </DialogHeader>
          
          {verifyingTicket && (
            <div className="space-y-4">
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-1">
                  Ticket: {verifyingTicket.ticketNumber}
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  {verifyingTicket.description}
                </p>
                <p className="text-xs text-green-600 font-medium">
                  ✓ OTP sent to: {verifyingTicket.createdBy?.email}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Verification Code
                </label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  OTP is valid for 15 minutes
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOtpDialogOpen(false);
                    setOtp("");
                    setVerifyingTicket(null);
                  }}
                  className="w-full sm:flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp || otp.length !== 6}
                  className="w-full text-primary-foreground gradient-primary sm:flex-1"
                >
                  {verifyingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Verify & Complete
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default UpdateStatus;
