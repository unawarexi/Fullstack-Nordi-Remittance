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


const LiveChat: React.FC = () => {
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

export default LiveChat;
