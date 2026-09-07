import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Clock, User, Tag, MessageSquare, Paperclip, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const timeline = [
  { time: "2h ago", text: "Ticket created by John Doe", type: "created" },
  { time: "1h 45m ago", text: "Assigned to Alex Chen", type: "assigned" },
  { time: "1h ago", text: "Status changed to In Progress", type: "status" },
  { time: "30m ago", text: "Alex Chen added a comment", type: "comment" },
];

const TicketDetails = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout title="Ticket #1024">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4 sm:p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/15 text-primary">High Priority</span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]">In Progress</span>
            </div>
            <h2 className="text-xl font-display font-bold text-foreground mb-2">VPN not connecting on office network</h2>
            <p className="text-sm text-muted-foreground">Unable to connect to corporate VPN since morning. Getting timeout error after 30 seconds. Tried restarting laptop and router. Issue persists on both Wi-Fi and ethernet.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-4 sm:p-6">
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" /> Comments
            </h3>
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-xl p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">AC</div>
                  <span className="text-sm font-medium text-foreground">Alex Chen</span>
                  <span className="text-xs text-muted-foreground">30m ago</span>
                </div>
                <p className="text-sm text-muted-foreground">I've checked the VPN server logs. There seems to be a certificate expiry issue. Regenerating certificates now.</p>
              </div>
            </div>
            <div className="mt-4">
              <textarea placeholder="Add a comment..." rows={3} className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
              <button className="mt-2 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground gradient-primary sm:w-auto">Send</button>
            </div>
          </motion.div>
        </div>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-2xl p-5">
            <h3 className="font-display font-semibold text-foreground mb-3">Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><User className="w-4 h-4" /> <span>Assigned: Alex Chen</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Tag className="w-4 h-4" /> <span>Category: Network</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4" /> <span>SLA: 2h 15m remaining</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Paperclip className="w-4 h-4" /> <span>0 attachments</span></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-5">
            <h3 className="font-display font-semibold text-foreground mb-3">Timeline</h3>
            <div className="space-y-3">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm text-foreground">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TicketDetails;
