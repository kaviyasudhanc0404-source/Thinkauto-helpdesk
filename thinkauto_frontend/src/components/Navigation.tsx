import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import BrandLogo from "./BrandLogo";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Plus,
  ListTodo,
  BarChart3,
  UserPlus,
  Settings,
  LogOut,
  Command,
  X,
  Inbox,
  Shield,
  Activity,
  MessageSquare,
  ClipboardList,
  UserCog,
  FileText,
  Wrench,
} from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { role, userName, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const employeeLinks = [
    { icon: Home, label: "Dashboard", path: "/employee/dashboard" },
    { icon: Plus, label: "Raise Ticket", path: "/employee/raise-ticket" },
    { icon: ListTodo, label: "My Tickets", path: "/employee/my-tickets" },
    { icon: MessageSquare, label: "History", path: "/employee/consultation-logs" },
  ];

  const technicianLinks = [
    { icon: Home, label: "Dashboard", path: "/technician/dashboard" },
    { icon: Inbox, label: "Assigned Tickets", path: "/technician/assigned-tickets" },
    { icon: Activity, label: "Update Status", path: "/technician/update-status" },
    { icon: MessageSquare, label: "History", path: "/technician/consultation-logs" },
  ];

  const adminLinks = [
    { icon: Home, label: "Dashboard", path: "/admin/dashboard" },
    { icon: ClipboardList, label: "All Tickets", path: "/admin/all-tickets" },
    { icon: UserPlus, label: "Assign Tickets", path: "/admin/assign-ticket" },
    { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
    { icon: Wrench, label: "Technicians", path: "/admin/technicians" },
    { icon: UserCog, label: "Employees", path: "/admin/employees" },
    { icon: FileText, label: "Reports", path: "/admin/reports" },
    { icon: Shield, label: "SLA Monitor", path: "/admin/sla-monitor" },
    { icon: MessageSquare, label: "History", path: "/admin/consultation-logs" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

  const links =
    role === "admin" ? adminLinks : role === "technician" ? technicianLinks : employeeLinks;

  const handleNav = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 rounded-2xl gradient-primary p-3.5 glow-orange shadow-2xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
      >
        <Command className="h-5 w-5 text-primary-foreground" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            <motion.aside
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-20 left-4 z-[60] flex max-h-[calc(100dvh-6rem)] w-[calc(100vw-2rem)] max-w-72 flex-col rounded-2xl border border-border bg-background/95 p-4 shadow-2xl backdrop-blur-2xl sm:bottom-24 sm:left-6 sm:w-72 sm:p-5"
              aria-label="Primary navigation"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <BrandLogo size="sm" />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Close navigation menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 rounded-xl bg-secondary/50 px-3 py-2">
                <p className="text-xs text-muted-foreground">Signed in as</p>
                <p className="truncate text-sm font-medium text-foreground">{userName}</p>
                <span className="text-xs font-medium capitalize text-primary">{role}</span>
              </div>

              <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
                {links.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <button
                      key={link.path}
                      type="button"
                      onClick={() => handleNav(link.path)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                        isActive
                          ? "gradient-primary text-primary-foreground glow-orange"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <link.icon className="h-4 w-4 shrink-0" />
                      <span>{link.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-4 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-destructive transition-all hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
