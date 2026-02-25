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
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import {
  PageContainer, DashCard,
} from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useToastStore } from "@store/toast.store";

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors";
const labelCls = "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

/* ═══════ CONTACT US ═══════ */
export const ContactUs: React.FC = () => {
  const contacts = [
    { icon: Phone, label: "Phone", value: "+1 (800) 123-4567", desc: "Mon–Fri, 8am–8pm EST", gradient: "from-indigo-500 to-purple-500" },
    { icon: Mail, label: "Email", value: "support@nordi.com", desc: "We reply within 24 hours", gradient: "from-emerald-500 to-teal-500" },
    { icon: MapPin, label: "Office", value: "123 Finance Street, NY", desc: "Visit us in person", gradient: "from-amber-500 to-orange-500" },
    { icon: Globe, label: "Website", value: "www.nordi.com", desc: "Help center & resources", gradient: "from-pink-500 to-rose-500" },
  ];

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Contact Us"
          subtitle="We're here to help — reach out anytime"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Support", href: "/customer/support" },
            { label: "Contact" },
          ]}
        />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {contacts.map((c) => (
          <motion.div key={c.label} variants={dashboardItemVariants}>
            <DashCard className="cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${c.gradient} rounded-2xl flex items-center justify-center text-white flex-shrink-0`}>
                  <c.icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{c.label}</h3>
                  <p className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400">{c.value}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.desc}</p>
                </div>
              </div>
            </DashCard>
          </motion.div>
        ))}
      </div>

      <DashCard className="mt-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Send a Message</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Name</label>
              <input type="text" placeholder="Your name" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" placeholder="your@email.com" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Subject</label>
            <input type="text" placeholder="How can we help?" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Message</label>
            <textarea rows={4} placeholder="Describe your issue…" className={`${inputCls} resize-none`} />
          </div>
          <motion.button
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs sm:text-sm font-medium"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Send size={16} /> Send Message
          </motion.button>
        </div>
      </DashCard>
    </PageContainer>
  );
};

/* ═══════ LIVE CHAT ═══════ */
export const LiveChat: React.FC = () => {
  const [messages, setMessages] = useState([
    { id: 1, from: "bot", text: "Hello! 👋 I'm Nordi Assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages((p) => [
      ...p,
      { id: p.length + 1, from: "user", text: input },
      { id: p.length + 2, from: "bot", text: "Thanks for your message! A support agent will be with you shortly." },
    ]);
    setInput("");
  };

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Live Chat"
          subtitle="Chat with our support team in real-time"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Support", href: "/customer/support" },
            { label: "Live Chat" },
          ]}
        />
      </motion.div>

      <div className="max-w-2xl">
        <DashCard padding="none">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white">
              <Headphones size={16} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Nordi Support</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Online
              </p>
            </div>
          </div>
          <div className="h-80 sm:h-96 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm ${
                    m.from === "user"
                      ? "bg-indigo-600 text-white rounded-br-md"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-md"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-800 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message…"
              className={`${inputCls} flex-1`}
            />
            <motion.button
              onClick={send}
              className="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send size={16} />
            </motion.button>
          </div>
        </DashCard>
      </div>
    </PageContainer>
  );
};

/* ═══════ FAQs ═══════ */
export const FAQs: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(null);

  const faqs = [
    { q: "How do I reset my password?", a: "Go to Settings > Security > Change Password, or click 'Forgot Password' on the login page. You'll receive a verification email to reset your password." },
    { q: "How long do transfers take?", a: "Domestic transfers are usually instant or within 1–2 business hours. International transfers may take 1–3 business days depending on the destination." },
    { q: "What are the transfer fees?", a: "Domestic transfers are free for amounts under $5,000/month. International transfers have a competitive fee starting at 0.5% of the transfer amount." },
    { q: "How do I enable two-factor authentication?", a: "Navigate to Settings > Security > Two-Factor Authentication and follow the setup guide. You can use SMS, email, or an authenticator app." },
    { q: "Can I have multiple accounts?", a: "Yes! You can open multiple savings and current accounts in different currencies. Visit Accounts > Open New Account to get started." },
    { q: "How do I dispute a transaction?", a: "Contact our support team via Live Chat or call us. You can also go to Transactions, find the transaction, and click 'Report Issue'." },
  ];

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="FAQs"
          subtitle="Find answers to common questions"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Support", href: "/customer/support" },
            { label: "FAQs" },
          ]}
        />
      </motion.div>

      <div className="max-w-2xl space-y-2">
        {faqs.map((faq, i) => (
          <motion.div key={i} variants={dashboardItemVariants}>
            <DashCard className="cursor-pointer" onClick={() => setOpenId(openId === i ? null : i)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                    <HelpCircle size={14} />
                  </div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{faq.q}</h4>
                </div>
                {openId === i ? (
                  <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                )}
              </div>
              <AnimatePresence>
                {openId === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </DashCard>
          </motion.div>
        ))}
      </div>
    </PageContainer>
  );
};

/* ═══════ SCHEDULE APPOINTMENT ═══════ */
export const ScheduleAppointment: React.FC = () => {
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
