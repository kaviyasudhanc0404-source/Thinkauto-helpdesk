import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import BrandLogo from "@/components/BrandLogo";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, User, Wrench, Loader2, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("employee");
  const [loading, setLoading] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  
  // Validation states
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  // Validation functions
  const validateUsername = (value: string): string => {
    if (!value.trim()) {
      return "Username is required";
    }
    if (value.trim().length < 3) {
      return "Username must be at least 3 characters";
    }
    if (value.trim().length > 30) {
      return "Username must not exceed 30 characters";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return "Username can only contain letters, numbers, and underscores (no spaces)";
    }
    return "";
  };

  const validateEmail = (value: string): string => {
    if (!value.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (value: string): string => {
    if (!value) {
      return "Password is required";
    }
    if (value.length < 6) {
      return "Password must be at least 6 characters";
    }
    if (value.length > 128) {
      return "Password must not exceed 128 characters";
    }
    if (!/[a-z]/.test(value)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[A-Z]/.test(value)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[0-9]/.test(value)) {
      return "Password must contain at least one number";
    }
    return "";
  };

  const getPasswordStrength = (pass: string): { strength: string; color: string; percentage: number } => {
    let strength = 0;
    if (pass.length >= 6) strength += 20;
    if (pass.length >= 10) strength += 20;
    if (/[a-z]/.test(pass)) strength += 20;
    if (/[A-Z]/.test(pass)) strength += 20;
    if (/[0-9]/.test(pass)) strength += 10;
    if (/[^a-zA-Z0-9]/.test(pass)) strength += 10;

    if (strength < 40) return { strength: "Weak", color: "bg-red-500", percentage: strength };
    if (strength < 70) return { strength: "Medium", color: "bg-yellow-500", percentage: strength };
    return { strength: "Strong", color: "bg-green-500", percentage: strength };
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const usernameErr = validateUsername(username);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setUsernameError(usernameErr);
    setEmailError(emailErr);
    setPasswordError(passwordErr);

    // Check for any validation errors
    if (usernameErr || emailErr || passwordErr) {
      toast({
        title: "Validation Error",
        description: "Please fix all errors before submitting",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords are identical",
        variant: "destructive",
      });
      return;
    }

    setPasswordsMatch(true);

    setLoading(true);

    try {
      const response = await api.signup({
        username,
        email,
        password,
        role,
      });

      if (response.success) {
        const userData = response.data.user;
        const token = response.data.token;

        // Store token
        api.setToken(token);

        // Update auth context
        login(userData.role, userData.name, userData);

        // Navigate based on role
        const paths = {
          employee: "/employee/dashboard",
          technician: "/technician/dashboard",
          admin: "/admin/dashboard",
        };
        navigate(paths[userData.role]);

        toast({
          title: "Account created successfully",
          description: `Welcome to ThinkAuto, ${ userData.name}!`,
        });
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Only show Employee and Technician roles (Admin is hidden)
  const roles: { value: UserRole; label: string; desc: string; icon: typeof User }[] = [
    { value: "employee", label: "Employee", desc: "Raise & track support tickets", icon: User },
    { value: "technician", label: "Technician", desc: "Resolve & manage tickets", icon: Wrench },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden px-4 py-20 gradient-dark sm:py-24">
      {/* Animated Background effects */}
      <motion.div 
        className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
        animate={{ 
          scale: [1, 1.3, 1],
          y: [0, 50, 0],
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-1/3 -left-32 w-80 h-80 rounded-full bg-accent/5 blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 40, 0],
        }}
        transition={{ 
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
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
        className="relative z-10 w-full max-w-xl"
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
          <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary via-orange-400 to-primary bg-clip-text text-transparent">Join ThinkAuto</h1>
          <p className="text-muted-foreground">Create your account to get started</p>
        </motion.div>

        <motion.div 
          className="glass-strong rounded-3xl p-6 sm:p-8 shadow-2xl border border-border/50"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <form onSubmit={handleSignup} className="space-y-5">
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
                        <r.icon className="w-4 h-4" />
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
                This determines your access level
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (touched.username) {
                      setUsernameError(validateUsername(e.target.value));
                    }
                  }}
                  onBlur={() => {
                    setTouched({ ...touched, username: true });
                    setUsernameError(validateUsername(username));
                  }}
                  className={`w-full bg-secondary/80 backdrop-blur-sm border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 transition-all hover:bg-secondary ${
                    usernameError && touched.username
                      ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                      : "border-border/50 focus:ring-primary/50 focus:border-primary/50"
                  }`}
                  placeholder="johndoe123"
                  required
                  minLength={3}
                  maxLength={30}
                />
                {usernameError && touched.username && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 mt-1.5 flex items-center gap-1"
                  >
                    <XCircle className="w-3 h-3" />
                    {usernameError}
                  </motion.p>
                )}
                {!usernameError && touched.username && username && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-green-500 mt-1.5 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Username is valid
                  </motion.p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) {
                      setEmailError(validateEmail(e.target.value));
                    }
                  }}
                  onBlur={() => {
                    setTouched({ ...touched, email: true });
                    setEmailError(validateEmail(email));
                  }}
                  className={`w-full bg-secondary/80 backdrop-blur-sm border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 transition-all hover:bg-secondary ${
                    emailError && touched.email
                      ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                      : "border-border/50 focus:ring-primary/50 focus:border-primary/50"
                  }`}
                  placeholder="you@company.com"
                  required
                />
                {emailError && touched.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 mt-1.5 flex items-center gap-1"
                  >
                    <XCircle className="w-3 h-3" />
                    {emailError}
                  </motion.p>
                )}
                {!emailError && touched.email && email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-green-500 mt-1.5 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Email is valid
                  </motion.p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) {
                      setPasswordError(validatePassword(e.target.value));
                    }
                    if (confirmPassword) {
                      setPasswordsMatch(e.target.value === confirmPassword);
                    }
                  }}
                  onBlur={() => {
                    setTouched({ ...touched, password: true });
                    setPasswordError(validatePassword(password));
                  }}
                  className={`w-full bg-secondary/80 backdrop-blur-sm border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 transition-all pr-12 hover:bg-secondary ${
                    passwordError && touched.password
                      ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                      : "border-border/50 focus:ring-primary/50 focus:border-primary/50"
                  }`}
                  placeholder="Min 6 characters, 1 uppercase, 1 number"
                  minLength={6}
                  required
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
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Password Strength:</span>
                    <span className={`text-xs font-semibold ${
                      getPasswordStrength(password).strength === "Strong" ? "text-green-500" :
                      getPasswordStrength(password).strength === "Medium" ? "text-yellow-500" :
                      "text-red-500"
                    }`}>
                      {getPasswordStrength(password).strength}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getPasswordStrength(password).percentage}%` }}
                      transition={{ duration: 0.3 }}
                      className={`h-full ${getPasswordStrength(password).color}`}
                    />
                  </div>
                </div>
              )}

              {passwordError && touched.password && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 mt-1.5 flex items-center gap-1"
                >
                  <XCircle className="w-3 h-3" />
                  {passwordError}
                </motion.p>
              )}

              {/* Password Requirements Checklist */}
              {touched.password && password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2 space-y-1"
                >
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Requirements:</p>
                  {[
                    { test: password.length >= 6, label: "At least 6 characters" },
                    { test: /[a-z]/.test(password), label: "One lowercase letter" },
                    { test: /[A-Z]/.test(password), label: "One uppercase letter" },
                    { test: /[0-9]/.test(password), label: "One number" },
                  ].map((req, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`text-xs flex items-center gap-1.5 ${
                        req.test ? "text-green-500" : "text-muted-foreground"
                      }`}
                    >
                      {req.test ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-current" />
                      )}
                      {req.label}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setTouched({ ...touched, confirmPassword: true });
                    setPasswordsMatch(password === e.target.value);
                  }}
                  onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                  className={`w-full bg-secondary/80 backdrop-blur-sm border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 transition-all pr-20 hover:bg-secondary ${
                    confirmPassword && passwordsMatch
                      ? "border-green-500/50 focus:ring-green-500/50 focus:border-green-500/50"
                      : confirmPassword && !passwordsMatch
                      ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                      : "border-border/50 focus:ring-primary/50 focus:border-primary/50"
                  }`}
                  placeholder="Re-enter your password"
                  minLength={6}
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {confirmPassword && touched.confirmPassword && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      {passwordsMatch ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </motion.div>
                  )}
                  <motion.button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-lg hover:bg-primary/10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </motion.button>
                </div>
              </div>
              {confirmPassword && !passwordsMatch && touched.confirmPassword && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 mt-1.5 flex items-center gap-1"
                >
                  <XCircle className="w-3 h-3" />
                  Passwords do not match
                </motion.p>
              )}
              {confirmPassword && passwordsMatch && touched.confirmPassword && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-green-500 mt-1.5 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Passwords match perfectly
                </motion.p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading || (confirmPassword && !passwordsMatch)}
              className="w-full gradient-primary text-primary-foreground font-bold py-3.5 rounded-xl glow-orange hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98]"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
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
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors inline-flex items-center gap-1 hover:gap-2">
              Sign in now
              <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;
