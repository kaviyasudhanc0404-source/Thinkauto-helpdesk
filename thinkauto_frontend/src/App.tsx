import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateTicket from "./pages/CreateTicket";
import MyTickets from "./pages/MyTickets";
import TicketDetails from "./pages/TicketDetails";
import Profile from "./pages/Profile";
import AssignedTickets from "./pages/AssignedTickets";
import UpdateStatus from "./pages/UpdateStatus";
import AllTickets from "./pages/AllTickets";
import AssignTicket from "./pages/AssignTicket";
import Employees from "./pages/Employees";
import Technicians from "./pages/Technicians";
import Reports from "./pages/Reports";
import SLAMonitor from "./pages/SLAMonitor";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import ConsultationLogs from "./pages/ConsultationLogs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Employee */}
            <Route path="/employee" element={<Navigate to="/employee/dashboard" replace />} />
            <Route path="/employee/dashboard" element={<ProtectedRoute requiredRole="employee"><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="/employee/raise-ticket" element={<ProtectedRoute requiredRole="employee"><CreateTicket /></ProtectedRoute>} />
            <Route path="/employee/my-tickets" element={<ProtectedRoute requiredRole="employee"><MyTickets /></ProtectedRoute>} />
            <Route path="/employee/ticket-details" element={<ProtectedRoute requiredRole="employee"><TicketDetails /></ProtectedRoute>} />
            <Route path="/employee/consultation-logs" element={<ProtectedRoute requiredRole="employee"><ConsultationLogs /></ProtectedRoute>} />
            <Route path="/employee/profile" element={<ProtectedRoute requiredRole="employee"><Profile /></ProtectedRoute>} />

            {/* Technician */}
            <Route path="/technician" element={<Navigate to="/technician/dashboard" replace />} />
            <Route path="/technician/dashboard" element={<ProtectedRoute requiredRole="technician"><TechnicianDashboard /></ProtectedRoute>} />
            <Route path="/technician/assigned-tickets" element={<ProtectedRoute requiredRole="technician"><AssignedTickets /></ProtectedRoute>} />
            <Route path="/technician/ticket-details" element={<ProtectedRoute requiredRole="technician"><TicketDetails /></ProtectedRoute>} />
            <Route path="/technician/update-status" element={<ProtectedRoute requiredRole="technician"><UpdateStatus /></ProtectedRoute>} />
            <Route path="/technician/consultation-logs" element={<ProtectedRoute requiredRole="technician"><ConsultationLogs /></ProtectedRoute>} />
            <Route path="/technician/profile" element={<ProtectedRoute requiredRole="technician"><Profile /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/all-tickets" element={<ProtectedRoute requiredRole="admin"><AllTickets /></ProtectedRoute>} />
            <Route path="/admin/assign-ticket" element={<ProtectedRoute requiredRole="admin"><AssignTicket /></ProtectedRoute>} />
            <Route path="/admin/employees" element={<ProtectedRoute requiredRole="admin"><Employees /></ProtectedRoute>} />
            <Route path="/admin/technicians" element={<ProtectedRoute requiredRole="admin"><Technicians /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><Reports /></ProtectedRoute>} />
            <Route path="/admin/sla-monitor" element={<ProtectedRoute requiredRole="admin"><SLAMonitor /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><Settings /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><Analytics /></ProtectedRoute>} />
            <Route path="/admin/team" element={<Navigate to="/admin/technicians" replace />} />
            <Route path="/admin/users" element={<Navigate to="/admin/employees" replace />} />
            <Route path="/admin/consultation-logs" element={<ProtectedRoute requiredRole="admin"><ConsultationLogs /></ProtectedRoute>} />
            <Route path="/admin/profile" element={<ProtectedRoute requiredRole="admin"><Profile /></ProtectedRoute>} />

            {/* Legacy redirects */}
            <Route path="/create-ticket" element={<Navigate to="/employee/raise-ticket" replace />} />
            <Route path="/my-tickets" element={<Navigate to="/employee/my-tickets" replace />} />
            <Route path="/assigned" element={<Navigate to="/technician/assigned-tickets" replace />} />
            <Route path="/performance" element={<Navigate to="/technician/update-status" replace />} />
            <Route path="/analytics" element={<Navigate to="/admin/analytics" replace />} />
            <Route path="/team" element={<Navigate to="/admin/technicians" replace />} />
            <Route path="/sla" element={<Navigate to="/admin/sla-monitor" replace />} />
            <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
