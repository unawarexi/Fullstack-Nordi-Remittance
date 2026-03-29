// ============================================================================
// MOBILE SUB-PAGES — App, Device Mgmt, QR Payments, Notifications
// Dark mode + DashboardPrimitives + grey borders + responsive typography
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Smartphone, Monitor, QrCode, Bell, Shield, Download,
  Trash2, CheckCircle2, Fingerprint, Send, PieChart,
  ToggleLeft, ToggleRight, Tablet,
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import {
  PageContainer, DashCard,
} from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants } from "@core/animation/Animation";


const DeviceManagement: React.FC = () => {
  const [devices, setDevices] = useState([
    { id: 1, name: "iPhone 15 Pro", type: "phone", lastActive: "Just now", location: "New York, US", current: true },
    { id: 2, name: "MacBook Pro", type: "desktop", lastActive: "2 hours ago", location: "New York, US", current: false },
    { id: 3, name: "iPad Air", type: "tablet", lastActive: "3 days ago", location: "Boston, US", current: false },
  ]);

  const deviceIcon = (type: string) => {
    switch (type) {
      case "phone": return <Smartphone size={18} />;
      case "desktop": return <Monitor size={18} />;
      case "tablet": return <Tablet size={18} />;
      default: return <Smartphone size={18} />;
    }
  };

  const removeDevice = (id: number) =>
    setDevices((prev) => prev.filter((d) => d.id !== id));

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Device Management"
          subtitle="Manage devices connected to your account"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Mobile Banking", href: "/customer/mobile" },
            { label: "Devices" },
          ]}
        />
      </motion.div>

      <div className="space-y-3">
        {devices.map((d) => (
          <motion.div key={d.id} variants={dashboardItemVariants}>
            <DashCard>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${d.current ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}>
                    {deviceIcon(d.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{d.name}</h4>
                      {d.current && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                          This device
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      {d.lastActive} • {d.location}
                    </p>
                  </div>
                </div>
                {!d.current && (
                  <button
                    onClick={() => removeDevice(d.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </DashCard>
          </motion.div>
        ))}
      </div>
    </PageContainer>
  );
};

export default DeviceManagement;
