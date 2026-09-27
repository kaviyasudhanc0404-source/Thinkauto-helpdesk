import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Bot,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  MessageSquare,
  Search,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { isResolvedStatus, isUnsolvedStatus } from "@/lib/ticketStatus";

const ConsultationLogs = () => {
  const [logs, setLogs] = useState([]);
  const [ticketLogs, setTicketLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState(null);
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      setError("");
      const [chatResponse, ticketResponse] = await Promise.all([
        api.getChatLogs(),
        api.getTickets(),
      ]);

      if (chatResponse.success) {
        setLogs(chatResponse.data.logs || []);
      }

      if (ticketResponse.success) {
        setTicketLogs(
          (ticketResponse.data.tickets || []).map((ticket) => ({
            _id: `ticket-${ticket._id}`,
            source: "ticket",
            user: ticket.createdBy,
            userMessage: ticket.description,
            aiResponse: ticket.assignedTo
              ? `Assigned to ${ticket.assignedTo.name}. Category: ${ticket.category || 'N/A'}, Priority: ${ticket.priority || 'N/A'}.`
              : ticket.category
              ? `Ticket categorized as ${ticket.category} with ${ticket.priority} priority.`
              : "Created as a helpdesk ticket.",
            // 'failed' only for explicitly unsolved; open/in-progress = 'open', resolved = 'success'
            status: isUnsolvedStatus(ticket) ? "failed" : isResolvedStatus(ticket) ? "success" : "open",
            createdAt: ticket.createdAt,
            usage: { total_tokens: 0 },
          }))
        );
      }
    } catch (fetchError) {
      setLogs([]);
      setTicketLogs([]);
      setError(fetchError.message || "Unable to load history from the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const timer = window.setInterval(fetchLogs, 10000);
    return () => window.clearInterval(timer);
  }, []);

  // Merge chatbot logs + ticket consultations — show ALL user activity
  const displayLogs = useMemo(() => {
    const combined = [
      ...logs.map((l) => ({ ...l, source: l.source || "chat" })),
      ...ticketLogs,
    ];
    // Sort newest first
    return combined.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [logs, ticketLogs]);

  const filteredLogs = useMemo(
    () =>
      displayLogs.filter((log) => {
        const text = `${log.userMessage || ""} ${log.aiResponse || ""} ${log.user?.name || ""} ${log.user?.email || ""}`.toLowerCase();
        const matchesSearch = text.includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === "all" ||
          log.status === statusFilter ||
          (statusFilter === "success" && log.status === "open");
        return matchesSearch && matchesStatus;
      }),
    [displayLogs, searchQuery, statusFilter]
  );

  const stats = {
    total: displayLogs.length,
    // successful = resolved tickets + successful chatbot logs + open/in-progress tickets
    successful: displayLogs.filter((log) => log.status === "success" || log.status === "open").length,
    failed: displayLogs.filter((log) => log.status === "failed").length,
    today: displayLogs.filter((log) => new Date(log.createdAt).toDateString() === new Date().toDateString()).length,
  };

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleExport = () => {
    const csvContent = [
      ["Timestamp", "User", "Email", "Status", "User Message", "AI Response"],
      ...filteredLogs.map((log) => [
        new Date(log.createdAt).toLocaleString(),
        log.user?.name || log.user?.username || "Unknown",
        log.user?.email || "",
        log.status,
        (log.userMessage || "").replace(/"/g, '""'),
        (log.aiResponse || "").replace(/"/g, '""'),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Export successful", description: `Exported ${filteredLogs.length} history entries.` });
  };

  const getStatusTone = (status: string) => {
    if (status === "failed") {
      return {
        badgeVariant: "destructive" as const,
        icon: XCircle,
        iconClassName: "text-destructive",
        dotClassName: "bg-destructive/20",
        label: "failed",
      };
    }

    return {
      badgeVariant: "default" as const,
      icon: CheckCircle2,
      iconClassName: "text-[hsl(var(--success))]",
      dotClassName: "bg-[hsl(var(--success))]/20",
      label: status || "open",
    };
  };

  return (
    <DashboardLayout title="History">
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass border-border/50 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="gradient-primary rounded-2xl p-3 glow-orange">
                    <MessageSquare className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl">History overview</CardTitle>
                    <CardDescription>
                      All user interactions — chatbot &amp; helpdesk tickets
                    </CardDescription>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:gap-3">
                  <Badge variant="outline" className="bg-background/30">
                    <span className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> Auto-refresh 10s
                    </span>
                  </Badge>
                  <Badge variant="outline" className="bg-background/30">
                    {filteredLogs.length} / {displayLogs.length}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search by user, message, email..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="pl-10 bg-background/50 border-border/50"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full bg-background/50 border-border/50">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Successful</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={handleExport} variant="outline" className="gap-2 w-full md:w-auto">
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
                <div className="rounded-2xl border border-border/50 bg-background/20 p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
                    </div>
                    <div className="hidden rounded-2xl p-2.5 gradient-primary min-[380px]:block">
                      <MessageSquare className="w-5 h-5 text-primary-foreground" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/50 bg-background/20 p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Successful</p>
                      <p className="text-2xl font-bold text-[hsl(var(--success))] mt-1">{stats.successful}</p>
                    </div>
                    <div className="hidden rounded-2xl bg-[hsl(var(--success))]/20 p-2.5 min-[380px]:block">
                      <CheckCircle2 className="w-5 h-5 text-[hsl(var(--success))]" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/50 bg-background/20 p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Failed</p>
                      <p className="text-2xl font-bold text-destructive mt-1">{stats.failed}</p>
                    </div>
                    <div className="hidden rounded-2xl bg-destructive/20 p-2.5 min-[380px]:block">
                      <XCircle className="w-5 h-5 text-destructive" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/50 bg-background/20 p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Today</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stats.today}</p>
                    </div>
                    <div className="hidden rounded-2xl bg-secondary/60 p-2.5 min-[380px]:block">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
                <span>Tip: Tap/click an entry to view full details.</span>
                <span>Export respects current search & status filter.</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="glass border-border/50">
            <CardContent className="p-12 text-center">
              <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No history loaded</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        ) : filteredLogs.length === 0 ? (
          <Card className="glass border-border/50">
            <CardContent className="p-12 text-center">
              <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No history entries found</h3>
              <p className="text-sm text-muted-foreground">Chatbot conversations or helpdesk consultations will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Entries</h2>
                <p className="text-sm text-muted-foreground">Latest history items based on your current filters.</p>
              </div>
              <div className="text-xs text-muted-foreground">{filteredLogs.length} results</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredLogs.map((log, index) => {
                const tone = getStatusTone(log.status);
                const StatusIcon = tone.icon;
                const userName = log.user?.name || log.user?.username || "Unknown user";
                const userEmail = log.user?.email || "No email";
                const sourceLabel = log.source ? String(log.source) : "";

                return (
                  <motion.div
                    key={log._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.02, 0.25) }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedLog(log)}
                      className="w-full text-left"
                    >
                      <Card className="glass border-border/50 hover:bg-secondary/10 transition-colors">
                        <CardContent className="p-5">
                          <div className="flex flex-col items-start gap-3 min-[420px]:flex-row min-[420px]:justify-between min-[420px]:gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className={`${tone.dotClassName} rounded-2xl p-2.5 shrink-0`}>
                                <StatusIcon className={`w-5 h-5 ${tone.iconClassName}`} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground truncate">{userName}</p>
                                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                                {sourceLabel ? (
                                  <div className="mt-2">
                                    <Badge variant="outline" className="bg-background/30">
                                      {sourceLabel}
                                    </Badge>
                                  </div>
                                ) : null}
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-row flex-wrap items-center gap-2 min-[420px]:flex-col min-[420px]:items-end">
                              <Badge variant={tone.badgeVariant}>{tone.label}</Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> {formatDate(log.createdAt)}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3">
                            <div className="rounded-2xl border border-border/40 bg-background/30 p-3">
                              <p className="text-[11px] font-medium text-muted-foreground mb-1">User message</p>
                              <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3">{log.userMessage || "—"}</p>
                            </div>
                            <div className="rounded-2xl border border-border/40 bg-background/30 p-3">
                              <p className="text-[11px] font-medium text-muted-foreground mb-1">AI response</p>
                              <p className="text-sm text-foreground/90 whitespace-pre-wrap line-clamp-3">{log.aiResponse || "—"}</p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                            <span>Click to view full details</span>
                            <span>{log.usage?.total_tokens || 0} tokens</span>
                          </div>
                        </CardContent>
                      </Card>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="gradient-primary rounded-lg p-2">
                  <MessageSquare className="w-5 h-5 text-primary-foreground" />
                </div>
                History Details
              </DialogTitle>
              <DialogDescription>Chatbot request and AI response</DialogDescription>
            </DialogHeader>

            {selectedLog && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">User</p>
                    <p className="text-sm text-foreground font-medium">{selectedLog.user?.name || selectedLog.user?.username || "Unknown user"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Created At</p>
                    <p className="text-sm text-foreground">{formatDate(selectedLog.createdAt)}</p>
                  </div>
                </div>

                <div className="glass p-4 rounded-xl border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground mb-2">User Message</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selectedLog.userMessage}</p>
                </div>

                <div className="glass p-4 rounded-xl border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground mb-2">AI Response</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selectedLog.aiResponse}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ConsultationLogs;
