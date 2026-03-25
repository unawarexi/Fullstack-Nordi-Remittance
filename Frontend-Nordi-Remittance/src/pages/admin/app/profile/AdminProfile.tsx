import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Clock,
  MapPin,
  Camera,
  Save,
  LogOut,
  Activity,
  Fingerprint,
  Globe,
  Lock,
} from "lucide-react";
import {
  PageContainer,
  DashCard,
  SectionHeader,
  ActionButton,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { useToast } from "@store/toast.store";

export default function AdminProfile() {
  const toast = useToast();

  const [name, setName] = useState("Admin SuperUser");
  const [email, setEmail] = useState("admin@nordi.com");
  const [phone, setPhone] = useState("+46 70 123 4567");
  const [role, setRole] = useState("Super Administrator");
  const [timezone, setTimezone] = useState("Europe/Stockholm");

  const inputStyles = "w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all";
  const labelStyles = "text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block";

  const recentSessions = [
    { device: "Chrome / macOS", ip: "192.168.1.100", location: "Stockholm, Sweden", time: "Active now", current: true },
    { device: "Safari / iPhone", ip: "10.0.0.42", location: "Stockholm, Sweden", time: "2 hours ago", current: false },
    { device: "Firefox / Windows", ip: "85.24.100.55", location: "Helsinki, Finland", time: "1 day ago", current: false },
  ];

  const recentActivity = [
    { action: "Approved KYC application", resource: "KYC-2847", time: "14 min ago" },
    { action: "Updated system settings", resource: "Security Config", time: "1 hour ago" },
    { action: "Rejected loan application", resource: "LOAN-1432", time: "3 hours ago" },
    { action: "Created admin user", resource: "Maria Svensson", time: "5 hours ago" },
    { action: "Exported transaction report", resource: "Q1 2026", time: "Yesterday" },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Admin Profile"
        subtitle="Manage your account settings, security, and active sessions"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Profile" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-4">
          <DashCard>
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center shadow-sm"
                >
                  <Camera size={12} className="text-gray-500" />
                </motion.button>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-3">{name}</h3>
              <p className="text-[11px] text-gray-400">{email}</p>
              <span className="mt-2 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-semibold">{role}</span>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
              {[
                { icon: <Mail size={14} />, label: email },
                { icon: <Phone size={14} />, label: phone },
                { icon: <MapPin size={14} />, label: "Stockholm, Sweden" },
                { icon: <Globe size={14} />, label: timezone },
                { icon: <Clock size={14} />, label: "Joined Jan 2025" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-300">
                  <span className="text-gray-400">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </DashCard>

          {/* Security Quick Actions */}
          <DashCard>
            <SectionHeader title="Security" />
            <div className="space-y-2 mt-3">
              <motion.button whileHover={{ x: 2 }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-left text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <Key size={14} className="text-gray-400" />
                Change Password
              </motion.button>
              <motion.button whileHover={{ x: 2 }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-left text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <Fingerprint size={14} className="text-gray-400" />
                Two-Factor Authentication
                <span className="ml-auto px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-semibold">ON</span>
              </motion.button>
              <motion.button whileHover={{ x: 2 }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                <LogOut size={14} />
                Sign Out All Sessions
              </motion.button>
            </div>
          </DashCard>
        </div>

        {/* Edit Profile */}
        <div className="lg:col-span-2 space-y-4">
          <DashCard>
            <SectionHeader title="Edit Profile" subtitle="Update your personal information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className={labelStyles}>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputStyles} />
              </div>
              <div>
                <label className={labelStyles}>Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyles} />
              </div>
              <div>
                <label className={labelStyles}>Phone Number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputStyles} />
              </div>
              <div>
                <label className={labelStyles}>Timezone</label>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputStyles}>
                  <option value="Europe/Stockholm">Europe/Stockholm (CET)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Europe/Helsinki">Europe/Helsinki (EET)</option>
                  <option value="America/New_York">America/New York (EST)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <ActionButton label="Save Changes" icon={<Save size={14} />} onClick={() => toast.success("Profile updated successfully")} />
            </div>
          </DashCard>

          {/* Active Sessions */}
          <DashCard>
            <SectionHeader title="Active Sessions" subtitle="Devices currently logged in to your account" />
            <div className="space-y-3 mt-3">
              {recentSessions.map((session, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.06 } }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${session.current ? "bg-emerald-100 dark:bg-emerald-950/30" : "bg-gray-100 dark:bg-gray-800"}`}>
                      <Globe size={14} className={session.current ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">{session.device}</p>
                      <p className="text-[10px] text-gray-400">{session.ip} · {session.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.current ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Current
                      </span>
                    ) : (
                      <>
                        <span className="text-[10px] text-gray-400">{session.time}</span>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-2 py-1 rounded-lg text-[10px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                          Revoke
                        </motion.button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </DashCard>

          {/* Recent Activity */}
          <DashCard>
            <SectionHeader title="Recent Activity" subtitle="Your latest administrative actions" />
            <div className="space-y-0 mt-3">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                  <p className="text-xs text-gray-600 dark:text-gray-300 flex-1">
                    <span className="font-medium text-gray-900 dark:text-white">{act.action}</span>
                    {" — "}
                    <span className="text-gray-400">{act.resource}</span>
                  </p>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{act.time}</span>
                </div>
              ))}
            </div>
          </DashCard>
        </div>
      </div>
    </PageContainer>
  );
}
