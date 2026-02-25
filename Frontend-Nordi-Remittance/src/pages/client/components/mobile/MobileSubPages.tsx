// ============================================================================
// MOBILE BANKING SUB-PAGES — App, Devices, QR, Push Notifications
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Smartphone, Monitor, QrCode, Bell, Shield, Download,
  Trash2, CheckCircle2, Clock, ChevronRight, Settings,
  Fingerprint, Laptop, Tablet, AlertCircle, Eye, EyeOff,
  DollarSign, TrendingUp,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// ========================
// MOBILE APP
// ========================
export const MobileApp: React.FC = () => {
  const features = [
    { title: "Instant Transfers", desc: "Send money in seconds", icon: "⚡" },
    { title: "Bill Payments", desc: "Pay bills on the go", icon: "📱" },
    { title: "Card Controls", desc: "Manage cards anywhere", icon: "💳" },
    { title: "Face ID / Touch ID", desc: "Secure biometric login", icon: "🔐" },
    { title: "Budgeting Tools", desc: "Track spending habits", icon: "📊" },
    { title: "Notifications", desc: "Real-time transaction alerts", icon: "🔔" },
  ];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Mobile App" subtitle="Bank from anywhere with our mobile app"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Mobile Banking", href: "/customer/mobile" }, { label: "App" }]} />
      </motion.div>

      <div className="max-w-4xl">
        <motion.div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white mb-6 flex flex-col md:flex-row items-center gap-8" variants={itemVariants}>
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-3">Nordi Mobile</h2>
            <p className="text-indigo-200 mb-6">Experience banking redefined. Our mobile app puts the full power of Nordi at your fingertips.</p>
            <div className="flex gap-3">
              <motion.button className="px-5 py-3 bg-white text-indigo-700 rounded-xl text-sm font-semibold flex items-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Download size={16} /> App Store
              </motion.button>
              <motion.button className="px-5 py-3 bg-white/10 border border-white/20 text-white rounded-xl text-sm font-semibold flex items-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Download size={16} /> Google Play
              </motion.button>
            </div>
          </div>
          <div className="w-48 h-80 bg-white/10 rounded-3xl border-2 border-white/20 flex items-center justify-center">
            <Smartphone size={64} className="text-white/40" />
          </div>
        </motion.div>

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={containerVariants}>
          {features.map((f) => (
            <motion.div key={f.title} className="bg-white rounded-xl shadow-sm p-5 flex items-start gap-3" variants={itemVariants} whileHover={{ y: -2 }}>
              <span className="text-2xl">{f.icon}</span>
              <div><h3 className="font-semibold text-gray-900 text-sm">{f.title}</h3><p className="text-xs text-gray-500 mt-1">{f.desc}</p></div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

// ========================
// DEVICE MANAGEMENT
// ========================
export const DeviceManagement: React.FC = () => {
  const devices = [
    { id: "1", name: "iPhone 15 Pro", type: "mobile", os: "iOS 17.2", lastActive: "Active now", location: "New York, US", trusted: true, icon: <Smartphone size={20} /> },
    { id: "2", name: "MacBook Pro", type: "desktop", os: "macOS 14.2", lastActive: "2 hours ago", location: "New York, US", trusted: true, icon: <Laptop size={20} /> },
    { id: "3", name: "iPad Air", type: "tablet", os: "iPadOS 17.2", lastActive: "3 days ago", location: "Boston, US", trusted: false, icon: <Tablet size={20} /> },
    { id: "4", name: "Chrome Browser", type: "browser", os: "Windows 11", lastActive: "1 week ago", location: "Unknown", trusted: false, icon: <Monitor size={20} /> },
  ];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Device Management" subtitle="Manage devices connected to your account"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Mobile Banking", href: "/customer/mobile" }, { label: "Devices" }]} />
      </motion.div>

      <motion.div className="space-y-4 max-w-3xl" variants={containerVariants}>
        {devices.map((device) => (
          <motion.div key={device.id} className="bg-white rounded-xl shadow-sm p-5" variants={itemVariants}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${device.trusted ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-400"}`}>{device.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{device.name}</h3>
                    {device.trusted && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">Trusted</span>}
                  </div>
                  <p className="text-sm text-gray-500">{device.os} · {device.location}</p>
                  <p className="text-xs text-gray-400">{device.lastActive}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!device.trusted && <button className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors">Trust</button>}
                <button className="p-2 text-gray-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

// ========================
// QR PAYMENTS
// ========================
export const QRPayments: React.FC = () => {
  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="QR Payments" subtitle="Scan or show QR code to pay or receive"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Mobile Banking", href: "/customer/mobile" }, { label: "QR" }]} />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <motion.div className="bg-white rounded-xl shadow-sm p-8 text-center" variants={itemVariants}>
          <h3 className="font-semibold text-indigo-900 mb-4">Scan to Pay</h3>
          <div className="w-48 h-48 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-gray-300">
            <QrCode size={48} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-4">Point your camera at a QR code to make a payment</p>
          <motion.button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            Open Scanner
          </motion.button>
        </motion.div>

        <motion.div className="bg-white rounded-xl shadow-sm p-8 text-center" variants={itemVariants}>
          <h3 className="font-semibold text-indigo-900 mb-4">Receive Payment</h3>
          <div className="w-48 h-48 mx-auto bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center mb-4 border border-indigo-200">
            <div className="grid grid-cols-3 gap-1 p-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className={`w-8 h-8 rounded-sm ${i % 3 === 0 ? "bg-indigo-900" : i % 2 === 0 ? "bg-purple-700" : "bg-indigo-600"}`} />
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">Show this QR code to receive payments</p>
          <motion.button className="px-6 py-3 border border-indigo-200 text-indigo-700 rounded-xl text-sm font-medium" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            Download QR
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ========================
// PUSH NOTIFICATIONS
// ========================
export const PushNotifications: React.FC = () => {
  const categories = [
    { name: "Transaction Alerts", desc: "Get notified for every transaction", enabled: true, icon: <DollarSign size={18} /> },
    { name: "Security Alerts", desc: "Login attempts, device changes", enabled: true, icon: <Shield size={18} /> },
    { name: "Payment Reminders", desc: "Upcoming bills and payments", enabled: true, icon: <Clock size={18} /> },
    { name: "Promotional Offers", desc: "Special deals and offers", enabled: false, icon: <Bell size={18} /> },
    { name: "Account Updates", desc: "Balance changes, statement ready", enabled: true, icon: <Settings size={18} /> },
    { name: "Rate Alerts", desc: "Currency and interest rate changes", enabled: false, icon: <TrendingUp size={18} /> },
  ];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Push Notifications" subtitle="Manage your notification preferences"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Mobile Banking", href: "/customer/mobile" }, { label: "Notifications" }]} />
      </motion.div>

      <motion.div className="space-y-4 max-w-3xl" variants={containerVariants}>
        {categories.map((cat) => (
          <motion.div key={cat.name} className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between" variants={itemVariants}>
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">{cat.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{cat.name}</h3>
                <p className="text-xs text-gray-500">{cat.desc}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={cat.enabled} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};
