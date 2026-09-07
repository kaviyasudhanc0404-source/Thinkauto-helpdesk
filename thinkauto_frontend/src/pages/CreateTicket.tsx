import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Send, Sparkles, Loader2, CheckCircle2, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const CreateTicket = () => {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please describe your issue",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setAnalyzing(true);

    try {
      // Submit ticket - backend will handle ML analysis and auto-routing
      const response = await api.post("/tickets", { description });

      if (response.success) {
        setAnalysis(response.data.mlAnalysis);
        
        toast({
          title: "Ticket created successfully!",
          description: `Category: ${response.data.mlAnalysis?.category || 'N/A'} | Priority: ${response.data.mlAnalysis?.priority || 'N/A'}`,
        });

        // Wait a moment to show the analysis
        setTimeout(() => {
          navigate("/employee/dashboard");
        }, 2000);
      }
    } catch (error: any) {
      console.error("Create ticket error:", error);
      toast({
        title: "Failed to create ticket",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setAnalyzing(false), 1500);
    }
  };

  return (
    <DashboardLayout title="Raise a Ticket">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl"
      >
        {/* AI Suggestion */}
        <div className="glass rounded-2xl p-4 mb-6 flex items-center gap-3 border-primary/20">
          <div className="gradient-primary rounded-xl p-2.5 shrink-0">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">AI Auto-Routing</p>
            <p className="text-xs text-muted-foreground">ThinkAuto AI will analyze your ticket and route it to the best technician.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Enter the issue</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Describe your issue in detail..."
              required
              disabled={loading}
            />
          </div>

          {/* AI Analysis Status */}
          {analyzing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-4 border border-primary/20"
            >
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-primary animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">AI is analyzing your ticket...</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5 }}
                        className="h-full bg-gradient-to-r from-primary to-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Analysis Results */}
          {analysis && !analyzing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-xl p-4 border border-green-500/20 bg-green-500/5"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground mb-2">Ticket Analyzed Successfully</p>
                  <div className="grid grid-cols-1 gap-2 text-xs min-[400px]:grid-cols-2">
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <span className="ml-2 font-medium text-foreground">{analysis.category}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Priority:</span>
                      <span className="ml-2 font-medium text-foreground">{analysis.priority}</span>
                    </div>
                    <div className="min-[400px]:col-span-2">
                      <span className="text-muted-foreground">Assigned to:</span>
                      <span className="ml-2 font-medium text-foreground">{analysis.assignedTeam}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-primary-foreground font-semibold py-3 rounded-xl glow-orange hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Ticket...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Submit Ticket
              </>
            )}
          </button>
        </form>
      </motion.div>
    </DashboardLayout>
  );
};

export default CreateTicket;
