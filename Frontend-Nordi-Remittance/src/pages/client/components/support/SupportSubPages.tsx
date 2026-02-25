// ============================================================================
// SUPPORT SUB-PAGES — Contact Us, Live Chat, FAQs, Schedule Appointment
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone, Mail, MessageCircle, MapPin, Clock, Calendar,
  ChevronDown, ChevronUp, Send, Headphones, HelpCircle,
  FileText, Video, Search, ExternalLink, CheckCircle2,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { useToastStore } from "@store/toast.store";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// ========================
// CONTACT US
// ========================
export const ContactUs: React.FC = () => {
  const showToast = useToastStore((s) => s.showToast);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const contacts = [
    { label: "Phone Support", value: "+1 (800) 123-4567", icon: <Phone size={20} />, color: "bg-emerald-50 text-emerald-600", desc: "Mon-Fri 8am-8pm EST" },
    { label: "Email Support", value: "support@nordi.com", icon: <Mail size={20} />, color: "bg-blue-50 text-blue-600", desc: "Response within 24 hours" },
    { label: "Live Chat", value: "Available 24/7", icon: <MessageCircle size={20} />, color: "bg-indigo-50 text-indigo-600", desc: "Instant support" },
    { label: "Branch Locator", value: "Find nearest branch", icon: <MapPin size={20} />, color: "bg-purple-50 text-purple-600", desc: "150+ locations" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Message sent! We'll respond within 24 hours.", "success");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Contact Us" subtitle="We're here to help"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Support", href: "/customer/support" }, { label: "Contact" }]} />
      </motion.div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" variants={containerVariants}>
        {contacts.map((c) => (
          <motion.div key={c.label} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer" variants={itemVariants} whileHover={{ y: -2 }}>
            <div className={`p-3 rounded-xl ${c.color} w-fit mb-3`}>{c.icon}</div>
            <h3 className="font-semibold text-gray-900 text-sm">{c.label}</h3>
            <p className="text-sm text-indigo-600 font-medium mt-1">{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 max-w-2xl" variants={itemVariants}>
        <h3 className="font-semibold text-indigo-900 mb-4">Send us a Message</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Name</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required /></div>
            <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required /></div>
          </div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Subject</label><input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Message</label><textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" required /></div>
          <motion.button type="submit" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium flex items-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Send size={16} /> Send Message
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  );
};

// ========================
// LIVE CHAT
// ========================
export const LiveChat: React.FC = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: "Hello! 👋 Welcome to Nordi Support. How can I help you today?", time: "now" },
  ]);

  const quickReplies = ["Check my balance", "Recent transactions", "Report fraud", "Card issues", "Transfer help", "Other"];

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { id: prev.length + 1, sender: "user", text: message, time: "now" }]);
    setMessage("");
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: prev.length + 1, sender: "bot", text: "Thank you for your message. Let me look into that for you. A support agent will be with you shortly.", time: "now" }]);
    }, 1000);
  };

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Live Chat" subtitle="Chat with our support team"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Support", href: "/customer/support" }, { label: "Chat" }]} />
      </motion.div>

      <motion.div className="bg-white rounded-xl shadow-sm max-w-2xl overflow-hidden" variants={itemVariants}>
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl"><Headphones size={20} className="text-white" /></div>
          <div><p className="text-white font-semibold text-sm">Nordi Support</p><p className="text-indigo-200 text-xs flex items-center gap-1"><span className="w-2 h-2 bg-emerald-400 rounded-full inline-block" /> Online</p></div>
        </div>

        <div className="h-80 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.sender === "user" ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-2 mb-3">
            {quickReplies.map((qr) => (
              <button key={qr} onClick={() => setMessage(qr)} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium hover:bg-indigo-100 transition-colors">{qr}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Type a message..." className="flex-1 px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            <motion.button onClick={handleSend} className="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><Send size={18} /></motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ========================
// FAQs
// ========================
export const FAQs: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const faqs = [
    { id: 1, category: "Accounts", q: "How do I open a new account?", a: "You can open a new account by navigating to 'My Accounts' and clicking 'Open New Account'. Choose your preferred account type and follow the guided setup process. Account verification typically takes 1-2 business days." },
    { id: 2, category: "Transfers", q: "What are the transfer limits?", a: "Daily transfer limits vary by account type: Standard accounts - $5,000/day, Premium - $25,000/day, Business - $100,000/day. International transfers may have additional limits. Contact support for higher limits." },
    { id: 3, category: "Cards", q: "How do I freeze my card?", a: "Go to 'My Cards' → select the card → 'Card Security' → toggle 'Freeze Card'. Your card will be instantly frozen. You can unfreeze it anytime from the same menu." },
    { id: 4, category: "Security", q: "What should I do if I suspect fraud?", a: "Immediately freeze your card, change your password, and contact us via Live Chat or call +1 (800) 123-4567. Our fraud team operates 24/7 and will investigate within 24 hours." },
    { id: 5, category: "Transfers", q: "How long do international transfers take?", a: "Standard international transfers take 1-3 business days. Express transfers can be completed within 2-4 hours for a small additional fee. Transfer times may vary based on the destination country." },
    { id: 6, category: "Accounts", q: "How do I update my personal information?", a: "Navigate to Profile → Personal Information. You can update your name, address, phone number, and email. Some changes may require identity verification for security purposes." },
    { id: 7, category: "Loans", q: "What are the loan eligibility requirements?", a: "Eligibility depends on credit score (minimum 650), income verification, employment status, and existing debt ratio. You can check your eligibility by visiting the 'Apply for Loan' page." },
    { id: 8, category: "Security", q: "How do I enable two-factor authentication?", a: "Go to Security Center → Two-Factor Authentication → Enable. You can choose between authenticator app, SMS, or email verification. We recommend using an authenticator app for the highest security." },
  ];

  const filtered = faqs.filter((f) => !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="FAQs" subtitle="Frequently asked questions"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Support", href: "/customer/support" }, { label: "FAQs" }]} />
      </motion.div>

      <motion.div className="bg-white rounded-xl shadow-sm p-4 mb-6 max-w-3xl" variants={itemVariants}>
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input placeholder="Search FAQs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" /></div>
      </motion.div>

      <motion.div className="space-y-3 max-w-3xl" variants={containerVariants}>
        {filtered.map((faq) => (
          <motion.div key={faq.id} className="bg-white rounded-xl shadow-sm overflow-hidden" variants={itemVariants}>
            <button onClick={() => setOpenId(openId === faq.id ? null : faq.id)} className="w-full p-5 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">{faq.category}</span>
                <h3 className="font-medium text-gray-900 text-sm">{faq.q}</h3>
              </div>
              {openId === faq.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            {openId === faq.id && (
              <motion.div className="px-5 pb-5 pt-0" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                <p className="text-sm text-gray-600 leading-relaxed pl-[76px]">{faq.a}</p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

// ========================
// SCHEDULE APPOINTMENT
// ========================
export const ScheduleAppointment: React.FC = () => {
  const showToast = useToastStore((s) => s.showToast);
  const [form, setForm] = useState({ type: "", date: "", time: "", branch: "", notes: "" });

  const appointmentTypes = [
    { value: "general", label: "General Inquiry", icon: <HelpCircle size={18} /> },
    { value: "account", label: "Account Setup", icon: <FileText size={18} /> },
    { value: "loan", label: "Loan Consultation", icon: <FileText size={18} /> },
    { value: "investment", label: "Investment Advisory", icon: <FileText size={18} /> },
    { value: "video", label: "Video Call", icon: <Video size={18} /> },
  ];

  const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Appointment scheduled! You'll receive a confirmation email.", "success");
  };

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Schedule Appointment" subtitle="Book a meeting with our advisors"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Support", href: "/customer/support" }, { label: "Appointment" }]} />
      </motion.div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={itemVariants}>
          <h3 className="font-semibold text-indigo-900 mb-4">Appointment Type</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {appointmentTypes.map((type) => (
              <button key={type.value} type="button" onClick={() => setForm({ ...form, type: type.value })}
                className={`p-3 rounded-xl border-2 text-left transition-all ${form.type === type.value ? "border-indigo-500 bg-indigo-50" : "border-transparent bg-gray-50 hover:bg-gray-100"}`}>
                <div className="text-indigo-600 mb-2">{type.icon}</div>
                <p className="text-sm font-medium text-gray-900">{type.label}</p>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={itemVariants}>
          <h3 className="font-semibold text-indigo-900 mb-4">Date & Time</h3>
          <div className="space-y-4">
            <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Preferred Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required /></div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Time Slot</label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <button key={slot} type="button" onClick={() => setForm({ ...form, time: slot })}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${form.time === slot ? "bg-indigo-600 text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}>{slot}</button>
                ))}
              </div>
            </div>
            <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Additional Notes</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" placeholder="Describe what you'd like to discuss..." /></div>
          </div>
        </motion.div>

        <motion.button type="submit" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium shadow-md flex items-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} variants={itemVariants}>
          <Calendar size={16} /> Schedule Appointment
        </motion.button>
      </form>
    </motion.div>
  );
};
