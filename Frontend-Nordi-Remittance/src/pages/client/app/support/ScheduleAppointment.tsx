// ============================================================================
// SUPPORT SUB-PAGES — Contact Us, Live Chat, FAQs, Appointment
// Dark mode + DashboardPrimitives + grey borders + responsive typography
// ============================================================================

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, Mail, MapPin, MessageCircle, HelpCircle,
  Calendar, ChevronDown, ChevronUp, Send, Clock,
  Headphones, Globe, ExternalLink,
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import {
  PageContainer, DashCard,
} from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useToastStore } from "@store/toast.store";

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors";
const labelCls = "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";


const ScheduleAppointment: React.FC = () => {
  const { showToast } = useToastStore();
  const [form, setForm] = useState({ date: "", time: "", branch: "", reason: "" });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.time) {
      showToast("Please select date and time", "error");
      return;
    }
    showToast("Appointment scheduled successfully!", "success");
    setForm({ date: "", time: "", branch: "", reason: "" });
  };

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Schedule Appointment"
          subtitle="Book a visit to your nearest branch"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Support", href: "/customer/support" },
            { label: "Appointment" },
          ]}
        />
      </motion.div>

      <div className="max-w-2xl">
        <DashCard>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Date</label>
                <input type="date" value={form.date} onChange={set("date")} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Time</label>
                <select value={form.time} onChange={set("time")} className={inputCls}>
                  <option value="">Select time</option>
                  {["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Branch</label>
              <select value={form.branch} onChange={set("branch")} className={inputCls}>
                <option value="">Select branch</option>
                <option value="ny">New York — Main Branch</option>
                <option value="la">Los Angeles — Downtown</option>
                <option value="ch">Chicago — Loop Office</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Reason for Visit</label>
              <textarea
                rows={3}
                value={form.reason}
                onChange={set("reason")}
                placeholder="Briefly describe your purpose…"
                className={`${inputCls} resize-none`}
              />
            </div>
            <motion.button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs sm:text-sm font-medium"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Calendar size={16} /> Schedule Appointment
            </motion.button>
          </form>
        </DashCard>

        <DashCard className="mt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Branch Hours</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Monday – Friday: 9:00 AM – 5:00 PM<br />
                Saturday: 9:00 AM – 1:00 PM<br />
                Sunday & Holidays: Closed
              </p>
            </div>
          </div>
        </DashCard>
      </div>
    </PageContainer>
  );
};

export default ScheduleAppointment;
