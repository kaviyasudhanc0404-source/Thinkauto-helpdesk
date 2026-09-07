import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  LogOut,
  KeyRound,
  Trash2,
  ChevronDown,
  Mail,
  UserCircle,
  Shield,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const ProfileDropdown = () => {
  const { role, userName, user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await api.logout();
      logout();
      navigate("/login");
      toast({
        title: "Logged out successfully",
        description: "See you again soon!",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
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
        logout();
        navigate("/login");
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
    if (userName) {
      const names = userName.split(" ");
      if (names.length >= 2) {
        return names[0][0] + names[1][0];
      }
      return userName.substring(0, 2);
    }
    return role?.substring(0, 2).toUpperCase() || "U";
  };

  const getRoleColor = () => {
    switch (role) {
      case "admin":
        return "bg-red-500";
      case "technician":
        return "bg-blue-500";
      default:
        return "bg-green-500";
    }
  };

  const profilePath = role ? `/${role}/profile` : "/profile";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          >
            <div className={`w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-orange-500 to-primary opacity-80"></div>
              <span className="relative z-10">{getInitials()}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
          </motion.button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] max-w-72 glass-strong border-border/50 p-2">
          <DropdownMenuLabel className="p-3">
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-base font-bold text-primary-foreground relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-orange-500 to-primary opacity-80"></div>
                <span className="relative z-10">{getInitials()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{userName || "User"}</p>
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                  <UserCircle className="w-3 h-3" />
                  @{user?.username || "username"}
                </p>
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3" />
                  {user?.email || "email@example.com"}
                </p>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-2 ${getRoleColor()} text-white`}>
                  <Shield className="w-3 h-3" />
                  {role}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="bg-border/50 my-2" />

          <DropdownMenuItem
            onClick={() => navigate(profilePath)}
            className="cursor-pointer rounded-lg hover:bg-secondary focus:bg-secondary transition-colors p-2.5 flex items-center gap-2"
          >
            <User className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">View Profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setShowChangePasswordDialog(true)}
            className="cursor-pointer rounded-lg hover:bg-secondary focus:bg-secondary transition-colors p-2.5 flex items-center gap-2"
          >
            <KeyRound className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Change Password</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-border/50 my-2" />

          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer rounded-lg hover:bg-secondary focus:bg-secondary transition-colors p-2.5 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">Logout</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="cursor-pointer rounded-lg hover:bg-red-500/10 focus:bg-red-500/10 transition-colors p-2.5 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-500">Delete Account</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
            <div className="flex gap-3 pt-2">
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
              <p>This action cannot be undone. This will permanently delete your account and remove all your data from our servers.</p>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Enter your password to confirm</label>
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
    </>
  );
};

export default ProfileDropdown;
