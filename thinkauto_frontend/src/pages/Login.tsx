import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import BrandLogo from "@/components/BrandLogo";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Loader2, ArrowLeft, User, Wrench } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("employee");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if this is admin email - don't send role for admin
      const isAdminEmail = email === "sudhanadmin@gmail.com";
      
      const response = await api.login({
        email,
        password,
        role: isAdminEmail ? undefined : role, // Don't send role for admin
      });

      if (response.success) {
        const userData = response.data.user;
        const token = response.data.token;

        // Store token
        api.setToken(token);

        // Update auth context
        login(userData.role, userData.name, userData);

        // Navigate based on actual user role from backend
        const paths = {
          employee: "/employee/dashboard",
          technician: "/technician/dashboard",
          admin: "/admin/dashboard",
        };
        navigate(paths[userData.role]);

        toast({
          title: "Login successful",
          description: `Welcome back, ${userData.name}!`,
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Only show Employee and Technician roles (Admin is hidden)
  const roles: { value: UserRole; label: string; desc: string }[] = [
    { value: "employee", label: "Employee", desc: "Raise & track tickets" },
    { value: "technician", label: "Technician", desc: "Resolve tickets" },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden px-4 py-20 gradient-dark sm:py-24">
      {/* Animated Background effects */}
      <motion.div 
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-accent/5 blur-3xl"
        animate={{ 
          scale: [1, 1.1, 1],
          x: [0, -30, 0],
        }}
        transition={{ 
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute top-4 left-4 sm:top-8 sm:left-8 z-10"
      >
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 backdrop-blur-sm hover:bg-secondary transition-all text-sm font-medium text-muted-foreground hover:text-foreground group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex justify-center mb-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
            >
              <BrandLogo size="lg" />
            </motion.div>
          </div>
          <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary via-orange-400 to-primary bg-clip-text text-transparent">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your helpdesk</p>
        </motion.div>

        <motion.div 
          className="glass-strong rounded-3xl p-6 sm:p-8 shadow-2xl border border-border/50"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Role Dropdown */}
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Select Your Role
              </label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger className="w-full bg-secondary/80 backdrop-blur-sm border-border/50 rounded-xl px-4 py-6 text-sm text-foreground focus:ring-2 focus:ring-primary/50 transition-all hover:bg-secondary">
                  <SelectValue placeholder="Choose your role" />
                </SelectTrigger>
                <SelectContent className="bg-secondary/95 backdrop-blur-lg border-border rounded-xl">
                  {roles.map((r) => (
                    <SelectItem 
                      key={r.value} 
                      value={r.value}
                      className="cursor-pointer hover:bg-primary/10 rounded-lg my-1 focus:bg-primary/20"
                    >
                      <div className="flex items-center gap-3">
                        {r.value === 'employee' ? <User className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                        <div>
                          <p className="font-semibold">{r.label}</p>
                          <p className="text-xs text-muted-foreground">{r.desc}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-primary rounded-full"></span>
                Choose your account type to continue
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Username or Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-secondary/80 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all hover:bg-secondary"
                placeholder="username or you@company.com"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-secondary/80 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all pr-12 hover:bg-secondary"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1 rounded-lg hover:bg-primary/10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-primary-foreground font-bold py-3.5 rounded-xl glow-orange hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98]"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            {/* Forgot Password */}
            <div className="text-center">
              <Link 
                to="#" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                Forgot your password?
              </Link>
            </div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors inline-flex items-center gap-1 hover:gap-2">
              Sign up now
              <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
