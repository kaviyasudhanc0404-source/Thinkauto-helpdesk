import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Bell, Globe, Lock, Database, Mail, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const defaults = {
  emailAlerts: true,
  pushAlerts: true,
  weeklyReports: true,
  language: "English",
  timezone: "Asia/Kolkata",
  passwordPolicy: "strong",
  retentionDays: 365,
  ticketTemplate: "Your ticket {{ticketNumber}} has been updated.",
};

const Settings = () => {
  const [settings, setSettings] = useState(defaults);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("thinkauto-admin-settings");
    if (saved) setSettings({ ...defaults, ...JSON.parse(saved) });
  }, []);

  const saveSettings = () => {
    localStorage.setItem("thinkauto-admin-settings", JSON.stringify(settings));
    toast({ title: "Settings saved", description: "Admin preferences were updated for this browser." });
  };

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-4xl space-y-4">
        <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-foreground">Notifications</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              ["emailAlerts", "Email alerts"],
              ["pushAlerts", "Push alerts"],
              ["weeklyReports", "Weekly reports"],
            ].map(([key, label]) => (
              <label key={key} className="bg-secondary/50 rounded-xl px-4 py-3 flex items-center justify-between text-sm text-foreground">
                {label}
                <input type="checkbox" checked={settings[key]} onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })} />
              </label>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-foreground">Language & Region</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })} className="bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50" />
            <input value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} className="bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-foreground">Security</h2>
            </div>
            <select value={settings.passwordPolicy} onChange={(e) => setSettings({ ...settings, passwordPolicy: e.target.value })} className="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50">
              <option value="standard">Standard passwords</option>
              <option value="strong">Strong passwords</option>
              <option value="strict">Strict passwords + rotation</option>
            </select>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-foreground">Data & Privacy</h2>
            </div>
            <input type="number" min="30" value={settings.retentionDays} onChange={(e) => setSettings({ ...settings, retentionDays: Number(e.target.value) })} className="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-foreground">Email Templates</h2>
          </div>
          <textarea value={settings.ticketTemplate} onChange={(e) => setSettings({ ...settings, ticketTemplate: e.target.value })} rows={4} className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/50" />
        </motion.section>

        <button onClick={saveSettings} className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground gradient-primary sm:w-auto">
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
