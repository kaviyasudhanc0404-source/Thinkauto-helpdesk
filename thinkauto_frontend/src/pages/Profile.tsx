import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Shield,
  Calendar,
  Edit2,
  Save,
  X,
  KeyRound,
  Trash2,
  IdCard,
  Power,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Profile = () => {
  const { user, userName, role, setUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Profile fields
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Delete account field
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setName(user.name || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phoneNumber || "");
      setDepartment(user.department || "");
      setIsAvailable((user as any).isAvailable !== false);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    // Validate username before saving
    if (!username || username.trim().length < 3) {
      toast({
        title: "Validation Error",
        description: "Username must be at least 3 characters long",
        variant: "destructive",
      });
      return;
    }

    if (!/^[a-z0-9_]+$/.test(username)) {
      toast({
        title: "Validation Error",
        description: "Username can only contain lowercase letters, numbers, and underscores",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Only send username if it has changed
      const profileData: any = {
        name,
        phoneNumber,
        department
      };

      // Only include username if it has actually changed
      if (username !== user?.username) {
        profileData.username = username;
      }

      const response = await api.updateProfile(profileData);
      if (response.success) {
        // Update the user context with new data
        if (response.data.user) {
          setUser(response.data.user);
        }
        
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        });
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({
        title: "Failed to update profile",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityToggle = async (checked: boolean) => {
    setIsAvailable(checked);
    try {
      const response = await api.put('/auth/availability', { isAvailable: checked });
      if (response.success) {
        setUser({ ...user, isAvailable: checked } as any);
        toast({
          title: checked ? "You're now available" : "You're now unavailable",
          description: checked 
            ? "You can receive new ticket assignments" 
            : "You won't receive new ticket assignments",
        });
      }
    } catch (error: any) {
      // Revert on error
      setIsAvailable(!checked);
      toast({
        title: "Failed to update availability",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both password fields match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.changePassword(currentPassword, newPassword);
      if (response.success) {
        toast({
          title: "Password changed",
          description: "Your password has been updated successfully",
        });
        setShowChangePasswordDialog(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      toast({
        title: "Failed to change password",
        description: error.message || "Invalid current password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast({
        title: "Password required",
        description: "Please enter your password to confirm account deletion",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.deleteAccount(deletePassword);
      if (response.success) {
        toast({
          title: "Account deleted",
          description: "Your account has been permanently deleted",
        });
        // Logout will be handled by the logout function
        window.location.href = "/login";
      }
    } catch (error: any) {
      toast({
        title: "Failed to delete account",
        description: error.message || "Invalid password or cannot delete admin account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
      setDeletePassword("");
    }
  };

  const getInitials = () => {
    if (name) {
      const names = name.split(" ");
      if (names.length >= 2) {
        return names[0][0] + names[1][0];
      }
      return name.substring(0, 2);
    }
    return "U";
  };

  const getRoleBadgeColor = () => {
    switch (role) {
      case "admin":
        return "bg-red-500";
      case "technician":
        return "bg-blue-500";
      default:
        return "bg-green-500";
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <DashboardLayout title="My Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-6 sm:p-8 border border-border/50"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-orange-500 to-primary opacity-80"></div>
                <span className="relative z-10">{getInitials()}</span>
              </motion.div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-foreground">{name || "User Name"}</h2>
              <p className="text-sm text-muted-foreground mt-1">@{username || "username"}</p>
              <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start flex-wrap">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${getRoleBadgeColor()} text-white`}>
                  <Shield className="w-3 h-3" />
                  {role}
                </span>
                {user?.isActive && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    Active
                  </span>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex w-full flex-wrap justify-center gap-2 sm:w-auto sm:justify-start">
              {!isEditing ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 sm:w-auto"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-green-600 disabled:opacity-50 sm:flex-none"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? "Saving..." : "Save"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsEditing(false);
                      // Reset fields
                      if (user) {
                        setUsername(user.username || "");
                        setName(user.name || "");
                        setPhoneNumber(user.phoneNumber || "");
                        setDepartment(user.department || "");
                      }
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-secondary/80 sm:flex-none"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Profile Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-strong rounded-2xl p-6 sm:p-8 border border-border/50"
        >
          <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User ID - Hide for Admin */}
            {role !== 'admin' && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <IdCard className="w-4 h-4" />
                  User ID
                </label>
                <div className="break-all rounded-lg border border-border/30 bg-secondary/50 px-4 py-3 font-mono text-sm text-foreground">
                  {user?._id || "N/A"}
                </div>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Username
                {isEditing && <span className="text-red-500 text-xs">*Required</span>}
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className={`w-full bg-secondary/80 border rounded-lg px-4 py-3 text-sm text-foreground outline-none focus:ring-2 transition-all ${
                      username.length < 3 && username.length > 0
                        ? 'border-red-500/50 focus:ring-red-500/50'
                        : 'border-border/50 focus:ring-primary/50'
                    }`}
                    placeholder="Enter username (lowercase, alphanumeric, underscore)"
                    minLength={3}
                    maxLength={30}
                    required
                  />
                  {username.length > 0 && username.length < 3 && (
                    <p className="text-xs text-red-500 mt-1">Username must be at least 3 characters</p>
                  )}
                  {!username && (
                    <p className="text-xs text-yellow-500 mt-1">Username is required</p>
                  )}
                </div>
              ) : (
                <div className="bg-secondary/50 border border-border/30 rounded-lg px-4 py-3 text-sm text-foreground">
                  @{username || "Not set"}
                </div>
              )}
            </div>

            {/* Full Name - Hide for Admin */}
            {role !== 'admin' && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-secondary/80 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="bg-secondary/50 border border-border/30 rounded-lg px-4 py-3 text-sm text-foreground">
                    {name || "Not set"}
                  </div>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <div className="break-all rounded-lg border border-border/30 bg-secondary/50 px-4 py-3 text-sm text-foreground">
                {email || "Not set"}
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-secondary/80 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="bg-secondary/50 border border-border/30 rounded-lg px-4 py-3 text-sm text-foreground">
                  {phoneNumber || "Not set"}
                </div>
              )}
            </div>

            {/* Department/Domain - Hide for Admin, show for Employee (Department) and Technician (Domain) */}
            {role !== 'admin' && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {role === 'technician' ? 'Domain' : 'Department'}
                </label>
                {isEditing ? (
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="w-full bg-secondary/80 border border-border/50 rounded-lg px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all">
                      <SelectValue placeholder={role === 'technician' ? 'Select your domain' : 'Select your department'} />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary/95 backdrop-blur-lg border-border rounded-xl">
                      {role === 'technician' ? (
                        <>
                          <SelectItem value="Network">Network</SelectItem>
                          <SelectItem value="Software">Software</SelectItem>
                          <SelectItem value="Hardware">Hardware</SelectItem>
                          <SelectItem value="Access">Access</SelectItem>
                          <SelectItem value="Security">Security</SelectItem>
                          <SelectItem value="Gmail">Gmail</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="Software Development">Software Development</SelectItem>
                          <SelectItem value="Frontend Development">Frontend Development</SelectItem>
                          <SelectItem value="Backend Development">Backend Development</SelectItem>
                          <SelectItem value="Full Stack Development">Full Stack Development</SelectItem>
                          <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                          <SelectItem value="Quality Assurance">Quality Assurance (QA/Testing)</SelectItem>
                          <SelectItem value="DevOps">DevOps & CI/CD</SelectItem>
                          <SelectItem value="Cloud Infrastructure">Cloud Infrastructure</SelectItem>
                          <SelectItem value="Data Science">Data Science & Analytics</SelectItem>
                          <SelectItem value="Machine Learning">Machine Learning & AI</SelectItem>
                          <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                          <SelectItem value="IT Support">IT Support & Helpdesk</SelectItem>
                          <SelectItem value="System Administration">System Administration</SelectItem>
                          <SelectItem value="Network Engineering">Network Engineering</SelectItem>
                          <SelectItem value="Database Administration">Database Administration</SelectItem>
                          <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                        <SelectItem value="Product Management">Product Management</SelectItem>
                        <SelectItem value="Project Management">Project Management</SelectItem>
                        <SelectItem value="Business Analysis">Business Analysis</SelectItem>
                        <SelectItem value="Technical Writing">Technical Writing & Documentation</SelectItem>
                        <SelectItem value="Human Resources">Human Resources</SelectItem>
                        <SelectItem value="Finance">Finance & Accounting</SelectItem>
                        <SelectItem value="Sales">Sales & Business Development</SelectItem>
                        <SelectItem value="Marketing">Marketing & Communications</SelectItem>
                        <SelectItem value="Administration">Administration</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <div className="bg-secondary/50 border border-border/30 rounded-lg px-4 py-3 text-sm text-foreground">
                  {department || "Not set"}
                </div>
              )}
              </div>
            )}

            {/* Role - Hide for Admin */}
            {role !== 'admin' && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Role
                </label>
                <div className="bg-secondary/50 border border-border/30 rounded-lg px-4 py-3 text-sm text-foreground capitalize">
                  {role || "Not set"}
                </div>
              </div>
            )}

            {/* Last Login - Hide for Admin */}
            {role !== 'admin' && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Last Login
                </label>
                <div className="bg-secondary/50 border border-border/30 rounded-lg px-4 py-3 text-sm text-foreground">
                  {formatDate(user?.lastLogin)}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Availability Toggle - Only for Technicians */}
        {role === 'technician' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-strong rounded-2xl p-6 sm:p-8 border border-border/50"
          >
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <Power className="w-5 h-5 text-primary" />
              Work Availability
            </h3>

            <div className="flex items-start justify-between gap-4 rounded-xl border border-border/30 bg-secondary/50 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground mb-1">
                  Available for Work
                </p>
                <p className="text-xs text-muted-foreground">
                  {isAvailable 
                    ? "You are currently available to receive new ticket assignments" 
                    : "You are currently unavailable for new ticket assignments"}
                </p>
              </div>
              <Switch
                checked={isAvailable}
                onCheckedChange={handleAvailabilityToggle}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </motion.div>
        )}

        {/* Security Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-2xl p-6 sm:p-8 border border-border/50"
        >
          <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Security & Privacy
          </h3>

          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowChangePasswordDialog(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-all"
            >
              <KeyRound className="w-4 h-4" />
              Change Password
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
        <DialogContent className="sm:max-w-md glass-strong border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-secondary/80 border border-border/50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Enter current password"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-secondary/80 border border-border/50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Enter new password"
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-secondary/80 border border-border/50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Confirm new password"
                minLength={6}
                required
              />
            </div>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setShowChangePasswordDialog(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="glass-strong border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-500">
              <Trash2 className="w-5 h-5" />
              Delete Account Permanently
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This action cannot be undone. This will permanently delete your account and remove all
                your data from our servers.
              </p>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full bg-secondary/80 border border-border/50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="Enter your password"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletePassword("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {loading ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Profile;
