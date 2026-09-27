import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bot,
  Check,
  Copy,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Mail,
  MailCheck,
  Pause,
  Play,
  Send,
  Sparkles,
  UserCheck,
  UserPlus,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Mailbox watched by the backend IMAP listener (emailTicketService)
export const SUPPORT_EMAIL = "freeuse1606@gmail.com";

const STEP_DURATION_MS = 6000;

type FlowKey = "portal" | "email";

interface Step {
  icon: LucideIcon;
  title: string;
  desc: string;
  points: string[];
  visual: ReactNode;
}

/* ---------- Small mock-UI building blocks ---------- */

const MockWindow = ({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) => (
  <div className="w-full max-w-sm mx-auto rounded-2xl border border-border/60 bg-card/80 shadow-xl overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60 bg-secondary/40">
      <span className="flex gap-1.5" aria-hidden="true">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
      </span>
      <Icon className="w-3.5 h-3.5 text-primary ml-1" />
      <span className="text-[11px] font-medium text-muted-foreground truncate">{title}</span>
    </div>
    <div className="p-4 space-y-3">{children}</div>
  </div>
);

const Field = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
    <div
      className={cn(
        "rounded-lg px-3 py-2 text-xs bg-secondary/60 border border-border/50 text-foreground break-words",
        highlight && "border-primary/70 ring-1 ring-primary/40",
      )}
    >
      {value}
    </div>
  </div>
);

const Chip = ({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "orange" | "green" }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium border",
      tone === "default" && "bg-secondary/60 border-border/60 text-foreground",
      tone === "orange" && "bg-primary/15 border-primary/40 text-primary",
      tone === "green" && "bg-green-500/15 border-green-500/40 text-green-400",
    )}
  >
    {children}
  </span>
);

const PrimaryBar = ({ icon: Icon, label }: { icon: LucideIcon; label: string }) => (
  <div className="gradient-primary text-primary-foreground rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1.5 glow-orange">
    <Icon className="w-3.5 h-3.5" /> {label}
  </div>
);

/* ---------- Visuals per step ---------- */

const VisualAccount = () => (
  <MockWindow title="ThinkAuto · Sign Up" icon={UserPlus}>
    <Field label="Full name" value="Priya Kumar" />
    <Field label="Work email" value="priya@company.com" highlight />
    <Field label="Role" value="Employee" />
    <PrimaryBar icon={UserPlus} label="Create Account" />
  </MockWindow>
);

const VisualRaiseForm = () => (
  <MockWindow title="Employee Panel · Raise a Ticket" icon={LayoutDashboard}>
    <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-secondary/40 p-2.5">
      <div className="gradient-primary rounded-md p-1.5">
        <Sparkles className="w-3 h-3 text-primary-foreground" />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-foreground">AI Auto-Routing</p>
        <p className="text-[10px] text-muted-foreground">Your ticket goes to the best technician.</p>
      </div>
    </div>
    <Field label="Enter the issue" value="My laptop can't connect to the office WiFi since this morning." highlight />
    <PrimaryBar icon={Send} label="Submit Ticket" />
  </MockWindow>
);

const VisualEmailCompose = () => (
  <MockWindow title="New Message" icon={Mail}>
    <Field label="From" value="priya@company.com (your registered email)" />
    <Field label="To" value={SUPPORT_EMAIL} highlight />
    <Field label="Subject" value="ThinkAuto - Laptop not connecting to WiFi" highlight />
    <Field label="Body" value="My laptop can't connect to the office WiFi since this morning. Other devices work fine." />
    <PrimaryBar icon={Send} label="Send" />
  </MockWindow>
);

const VisualInboxCheck = () => (
  <MockWindow title="ThinkAuto Mail Listener" icon={Inbox}>
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <motion.span
        className="w-2 h-2 rounded-full bg-primary"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      Checking inbox every 60s…
    </div>
    <div className="rounded-lg border border-border/60 bg-secondary/40 p-3 space-y-1.5">
      <p className="text-xs font-semibold text-foreground truncate">ThinkAuto - Laptop not connecting to WiFi</p>
      <p className="text-[11px] text-muted-foreground truncate">from priya@company.com</p>
    </div>
    <div className="space-y-1.5 text-[11px]">
      <p className="flex items-center gap-1.5 text-green-400"><Check className="w-3.5 h-3.5" /> Subject contains "ThinkAuto"</p>
      <p className="flex items-center gap-1.5 text-green-400"><Check className="w-3.5 h-3.5" /> Sender is a registered employee</p>
      <p className="flex items-center gap-1.5 text-green-400"><Check className="w-3.5 h-3.5" /> Issue description found in body</p>
    </div>
  </MockWindow>
);

const VisualAI = () => (
  <MockWindow title="AI Analysis" icon={Bot}>
    <p className="text-xs text-muted-foreground italic">"Laptop can't connect to the office WiFi…"</p>
    <div className="flex items-center gap-2">
      <motion.div
        className="gradient-primary rounded-lg p-2"
        animate={{ rotate: [0, 8, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Sparkles className="w-4 h-4 text-primary-foreground" />
      </motion.div>
      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="h-full gradient-primary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        />
      </div>
    </div>
    <div className="flex flex-wrap gap-2">
      <Chip tone="orange">Category: Network</Chip>
      <Chip tone="orange">Priority: High</Chip>
    </div>
  </MockWindow>
);

const technicians = [
  { name: "Arun · Network", load: 1, pick: true },
  { name: "Meena · Network", load: 4, pick: false },
  { name: "Ravi · Hardware", load: 0, pick: false, other: true },
];

const VisualRouting = () => (
  <MockWindow title="Smart Routing" icon={UserCheck}>
    <p className="text-[11px] text-muted-foreground">Matching department → fewest open tickets</p>
    <div className="space-y-2">
      {technicians.map((t) => (
        <div
          key={t.name}
          className={cn(
            "flex items-center justify-between rounded-lg border px-3 py-2 text-xs",
            t.pick ? "border-primary/70 bg-primary/10" : "border-border/60 bg-secondary/40",
            t.other && "opacity-40",
          )}
        >
          <span className="text-foreground font-medium">{t.name}</span>
          <span className="flex items-center gap-2 text-muted-foreground">
            {t.load} open
            {t.pick && <Chip tone="orange"><Check className="w-3 h-3" /> Assigned</Chip>}
          </span>
        </div>
      ))}
    </div>
  </MockWindow>
);

const VisualConfirm = ({ viaEmail }: { viaEmail?: boolean }) => (
  <MockWindow title="Inbox · priya@company.com" icon={MailCheck}>
    <div className="rounded-lg border border-border/60 bg-secondary/40 p-3 space-y-2">
      <p className="text-xs font-semibold text-foreground">Ticket Created Successfully - TKT-000123</p>
      <p className="text-[11px] text-muted-foreground">Your ticket has been created and assigned.</p>
      <div className="flex flex-wrap gap-1.5">
        <Chip>Network</Chip>
        <Chip>High</Chip>
        <Chip tone="green">Assigned: Arun</Chip>
        {viaEmail && <Chip>Source: Email</Chip>}
      </div>
    </div>
    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
      <Wrench className="w-3.5 h-3.5 text-primary" /> Technician Arun was also notified by email
    </div>
  </MockWindow>
);

const VisualResolve = () => (
  <MockWindow title="Ticket TKT-000123" icon={BadgeCheck}>
    <div className="flex items-center justify-between gap-1 text-[10px] font-medium">
      {["Open", "In Progress", "Resolved"].map((s, i) => (
        <div key={s} className="flex items-center gap-1 flex-1 last:flex-none">
          <span
            className={cn(
              "rounded-full px-2 py-1 border whitespace-nowrap",
              i === 2 ? "bg-green-500/15 border-green-500/40 text-green-400" : "bg-primary/15 border-primary/40 text-primary",
            )}
          >
            {s}
          </span>
          {i < 2 && <span className="flex-1 h-px bg-primary/40" />}
        </div>
      ))}
    </div>
    <div className="rounded-lg border border-border/60 bg-secondary/40 p-3">
      <p className="text-[11px] text-muted-foreground mb-2 flex items-center gap-1.5">
        <KeyRound className="w-3.5 h-3.5 text-primary" /> Verification OTP (sent to employee)
      </p>
      <div className="flex gap-1.5 justify-center">
        {"482913".split("").map((d, i) => (
          <span key={i} className="w-7 h-8 rounded-md border border-primary/50 bg-card flex items-center justify-center text-sm font-bold text-foreground">
            {d}
          </span>
        ))}
      </div>
    </div>
    <PrimaryBar icon={BadgeCheck} label="Verify & Resolve" />
  </MockWindow>
);

/* ---------- Flow definitions ---------- */

const resolveStep: Step = {
  icon: BadgeCheck,
  title: "Technician solves & you verify",
  desc: "The technician works the ticket and closes it only after you confirm the fix.",
  points: [
    "Status moves Open → In Progress (or On Hold)",
    "When fixed, you receive a 6-digit OTP by email and share it with the technician",
    "The OTP marks the ticket Resolved — tickets not verified within 24h become Unsolved",
    "Track everything in My Tickets on your dashboard",
  ],
  visual: <VisualResolve />,
};

const flows: Record<FlowKey, Step[]> = {
  portal: [
    {
      icon: UserPlus,
      title: "Sign in as an Employee",
      desc: "Create your account with Get Started and choose the Employee role, or sign in if you already have one.",
      points: ["Use your work email — it receives all ticket updates", "You land on the Employee Dashboard"],
      visual: <VisualAccount />,
    },
    {
      icon: LayoutDashboard,
      title: "Raise a Ticket from the panel",
      desc: "Open Raise a Ticket in the sidebar, describe the issue in your own words and hit Submit.",
      points: ["No category or priority to pick — just describe the problem", "More detail helps the AI route it better"],
      visual: <VisualRaiseForm />,
    },
    {
      icon: Bot,
      title: "AI analyzes the issue",
      desc: "ThinkAuto's ML service reads your description and classifies it instantly.",
      points: ["Category: Network, Hardware, Software, Access, Security, Gmail or Others", "Priority: Low, Medium, High or Critical"],
      visual: <VisualAI />,
    },
    {
      icon: UserCheck,
      title: "Auto-routed to a technician",
      desc: "The ticket is assigned to a technician from the matching department with the fewest open tickets.",
      points: ["Load-balanced so no one gets overloaded", "Falls back to any active technician if no specialist is free"],
      visual: <VisualRouting />,
    },
    {
      icon: MailCheck,
      title: "Confirmation in your inbox",
      desc: "You get a confirmation email with your ticket number, and the technician gets an assignment email.",
      points: ["Ticket numbers look like TKT-000123", "The ticket appears in My Tickets right away"],
      visual: <VisualConfirm />,
    },
    resolveStep,
  ],
  email: [
    {
      icon: UserPlus,
      title: "Have a registered account",
      desc: "Email tickets are accepted only from employees already signed up on ThinkAuto.",
      points: ["Send from the same email address you registered with", "Emails from unknown addresses are ignored"],
      visual: <VisualAccount />,
    },
    {
      icon: Mail,
      title: "Email your issue",
      desc: `Write to ${SUPPORT_EMAIL} with "ThinkAuto" in the subject and describe the problem in the body.`,
      points: [
        `To: ${SUPPORT_EMAIL}`,
        'Subject must include "ThinkAuto" — the rest becomes the ticket title',
        "Body: a clear description (at least 10 characters)",
      ],
      visual: <VisualEmailCompose />,
    },
    {
      icon: Inbox,
      title: "ThinkAuto picks it up",
      desc: "The mail listener checks the inbox about every minute and validates each new ThinkAuto email.",
      points: ["Verifies the subject and that you are a registered employee", "Extracts the issue from the body, ignoring reply quotes"],
      visual: <VisualInboxCheck />,
    },
    {
      icon: Bot,
      title: "AI analyzes the issue",
      desc: "Same AI as the portal — the email body is classified into a category and priority.",
      points: ["Category & priority are set automatically", "The ticket is marked with source: Email"],
      visual: <VisualAI />,
    },
    {
      icon: UserCheck,
      title: "Auto-routed to a technician",
      desc: "The least-loaded technician in the matching department is assigned automatically.",
      points: ["No admin action needed", "Falls back to any active technician if needed"],
      visual: <VisualRouting />,
    },
    {
      icon: MailCheck,
      title: "Confirmation email sent",
      desc: "A confirmation with your ticket number arrives in your inbox, and the technician is notified.",
      points: ["Sign in anytime to follow it in My Tickets", "No need to reply — updates come by email"],
      visual: <VisualConfirm viaEmail />,
    },
    resolveStep,
  ],
};

const flowTabs: { key: FlowKey; label: string; short: string; icon: LucideIcon }[] = [
  { key: "portal", label: "Employee Panel", short: "Panel", icon: LayoutDashboard },
  { key: "email", label: "Via Email", short: "Email", icon: Mail },
];

/* ---------- Main component ---------- */

interface DemoFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGetStarted: () => void;
}

const DemoFlow = ({ open, onOpenChange, onGetStarted }: DemoFlowProps) => {
  const [flow, setFlow] = useState<FlowKey>("portal");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [copied, setCopied] = useState(false);

  const steps = flows[flow];
  const current = steps[step];
  const isLast = step === steps.length - 1;

  // Restart from the beginning whenever the dialog opens
  useEffect(() => {
    if (open) {
      setFlow("portal");
      setStep(0);
      setPlaying(true);
    }
  }, [open]);

  // Auto-advance; stop at the last step
  useEffect(() => {
    if (!open || !playing || isLast) return;
    const id = setTimeout(() => setStep((s) => s + 1), STEP_DURATION_MS);
    return () => clearTimeout(id);
  }, [open, playing, step, isLast]);

  useEffect(() => {
    if (isLast) setPlaying(false);
  }, [isLast]);

  const selectFlow = (key: FlowKey) => {
    setFlow(key);
    setStep(0);
    setPlaying(true);
  };

  const goTo = (i: number) => {
    setStep(i);
    setPlaying(false);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard not available — address is still visible to copy manually
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[calc(100%-1.5rem)] p-0 gap-0 rounded-2xl sm:rounded-2xl border-border/60 bg-background overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)]">
        {/* Header */}
        <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-border/60 pr-12">
          <DialogTitle className="font-display text-lg sm:text-2xl font-bold text-foreground">
            How <span className="text-gradient">ThinkAuto</span> works
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
            Two ways to raise a ticket — both are analyzed by AI, routed to the right technician and confirmed by email.
          </DialogDescription>

          {/* Flow switcher */}
          <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-secondary/50 p-1 border border-border/50 max-w-md" role="tablist">
            {flowTabs.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={flow === t.key}
                onClick={() => selectFlow(t.key)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-all",
                  flow === t.key ? "gradient-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <t.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.short}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-[260px_1fr] lg:grid-cols-[290px_1fr]">
            {/* Step list — horizontal on mobile, vertical timeline on md+ */}
            <nav
              aria-label="Steps"
              className="border-b md:border-b-0 md:border-r border-border/60 bg-card/30 overflow-x-auto md:overflow-visible"
            >
              <ol className="flex md:flex-col gap-2 md:gap-0 p-3 md:p-4 min-w-max md:min-w-0">
                {steps.map((s, i) => {
                  const active = i === step;
                  const done = i < step;
                  return (
                    <li key={`${flow}-${i}`} className="md:relative">
                      {/* Timeline connector (desktop) */}
                      {i < steps.length - 1 && (
                        <span
                          aria-hidden="true"
                          className={cn(
                            "hidden md:block absolute left-[1.3rem] top-10 bottom-0 w-px",
                            done ? "bg-primary/70" : "bg-border",
                          )}
                        />
                      )}
                      <button
                        onClick={() => goTo(i)}
                        aria-current={active ? "step" : undefined}
                        className={cn(
                          "flex items-center gap-2.5 md:gap-3 rounded-xl px-2.5 py-2 md:py-2.5 text-left w-full transition-colors md:mb-1",
                          active ? "bg-primary/10 border border-primary/40" : "border border-transparent hover:bg-secondary/50",
                        )}
                      >
                        <span
                          className={cn(
                            "relative z-10 flex shrink-0 items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg text-xs font-bold transition-all",
                            active && "gradient-primary text-primary-foreground glow-orange",
                            done && "bg-primary/20 text-primary",
                            !active && !done && "bg-secondary text-muted-foreground",
                          )}
                        >
                          {done ? <Check className="w-4 h-4" /> : i + 1}
                        </span>
                        <span
                          className={cn(
                            "text-xs md:text-sm font-medium whitespace-nowrap md:whitespace-normal",
                            active ? "text-foreground" : "text-muted-foreground",
                            !active && "hidden md:inline",
                          )}
                        >
                          {s.title}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>

            {/* Active step */}
            <div className="p-4 sm:p-6">
              {/* Progress bar */}
              <div className="flex gap-1 mb-5" aria-hidden="true">
                {steps.map((_, i) => (
                  <div key={i} className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
                    {i < step && <div className="h-full w-full gradient-primary" />}
                    {i === step && (
                      <motion.div
                        key={`${flow}-${step}-${playing}`}
                        className="h-full gradient-primary"
                        initial={{ width: playing && !isLast ? "0%" : "100%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: playing && !isLast ? STEP_DURATION_MS / 1000 : 0, ease: "linear" }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${flow}-${step}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="grid lg:grid-cols-2 gap-6 items-center"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="gradient-primary rounded-xl p-2.5 shadow-lg glow-orange">
                        <current.icon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                        Step {step + 1} of {steps.length}
                      </span>
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-foreground mb-2">{current.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{current.desc}</p>
                    <ul className="space-y-2">
                      {current.points.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-xs sm:text-sm text-foreground/90">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span className="break-words min-w-0">{p}</span>
                        </li>
                      ))}
                    </ul>

                    {flow === "email" && step === 1 && (
                      <button
                        onClick={copyEmail}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors max-w-full"
                      >
                        {copied ? <Check className="w-4 h-4 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
                        <span className="truncate">{copied ? "Copied!" : `Copy ${SUPPORT_EMAIL}`}</span>
                      </button>
                    )}
                  </div>

                  <div>{current.visual}</div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3 border-t border-border/60 bg-card/30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => goTo(Math.max(0, step - 1))}
              disabled={step === 0}
              aria-label="Previous step"
              className="rounded-lg border border-border/60 p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => (isLast ? (setStep(0), setPlaying(true)) : setPlaying((p) => !p))}
              aria-label={isLast ? "Replay" : playing ? "Pause" : "Play"}
              className="rounded-lg border border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors flex items-center gap-1.5"
            >
              {playing && !isLast ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="hidden sm:inline">{isLast ? "Replay" : playing ? "Pause" : "Play"}</span>
            </button>
          </div>

          {isLast ? (
            <div className="flex items-center gap-2">
              {flow === "portal" && (
                <button
                  onClick={() => selectFlow("email")}
                  className="hidden sm:flex rounded-lg border border-border/60 px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary/50 transition-colors items-center gap-1.5"
                >
                  <Mail className="w-4 h-4" /> See email flow
                </button>
              )}
              <button
                onClick={onGetStarted}
                className="gradient-primary text-primary-foreground rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold glow-orange hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => goTo(step + 1)}
              className="gradient-primary text-primary-foreground rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DemoFlow;
