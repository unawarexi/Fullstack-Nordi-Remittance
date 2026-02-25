/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  ChevronDown,
  Calendar,
  DollarSign,
  AlertTriangle,
  Gift,
  Info,
  PieChart,
  FileText,
  Settings,
  Save,
  Globe,
} from "lucide-react";

interface Channel {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
}

interface NotificationType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  categories: NotificationCategory[];
}

interface NotificationCategory {
  id: string;
  name: string;
  channels: {
    channelId: string;
    enabled: boolean;
  }[];
}

const Communication: React.FC = () => {
  // Communication channels
  const [channels, setChannels] = useState<Channel[]>([
    { id: "email", name: "Email", icon: <Mail size={20} />, enabled: true },
    { id: "push", name: "Push Notifications", icon: <Bell size={20} />, enabled: true },
    { id: "sms", name: "SMS", icon: <Smartphone size={20} />, enabled: true },
    { id: "inApp", name: "In-App Messages", icon: <MessageSquare size={20} />, enabled: true },
  ]);

  // Notification types
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([
    {
      id: "account",
      name: "Account Updates",
      description: "Stay informed about changes to your account details, settings, and preferences",
      icon: <Settings size={20} />,
      categories: [
        {
          id: "login",
          name: "Login Activity",
          channels: [
            { channelId: "email", enabled: true },
            { channelId: "push", enabled: true },
            { channelId: "sms", enabled: false },
            { channelId: "inApp", enabled: true },
          ],
        },
        {
          id: "settings",
          name: "Settings Changes",
          channels: [
            { channelId: "email", enabled: true },
            { channelId: "push", enabled: false },
            { channelId: "sms", enabled: false },
            { channelId: "inApp", enabled: true },
          ],
        },
      ],
    },
    {
      id: "transaction",
      name: "Transaction Alerts",
      description: "Receive notifications about deposits, withdrawals, transfers, and payments",
      icon: <DollarSign size={20} />,
      categories: [
        {
          id: "deposits",
          name: "Deposits & Incoming Transfers",
          channels: [
            { channelId: "email", enabled: true },
            { channelId: "push", enabled: true },
            { channelId: "sms", enabled: true },
            { channelId: "inApp", enabled: true },
          ],
        },
        {
          id: "withdrawals",
          name: "Withdrawals & Outgoing Transfers",
          channels: [
            { channelId: "email", enabled: true },
            { channelId: "push", enabled: true },
            { channelId: "sms", enabled: true },
            { channelId: "inApp", enabled: true },
          ],
        },
        {
          id: "largeTransactions",
          name: "Large Transactions",
          channels: [
            { channelId: "email", enabled: true },
            { channelId: "push", enabled: true },
            { channelId: "sms", enabled: true },
            { channelId: "inApp", enabled: true },
          ],
        },
      ],
    },
    {
      id: "security",
      name: "Security Alerts",
      description: "Critical updates about the security of your account and potential risks",
      icon: <Shield size={20} />,
      categories: [
        {
          id: "suspicious",
          name: "Suspicious Activity",
          channels: [
            { channelId: "email", enabled: true },
            { channelId: "push", enabled: true },
            { channelId: "sms", enabled: true },
            { channelId: "inApp", enabled: true },
          ],
        },
        {
          id: "passwordChanges",
          name: "Password Changes",
          channels: [
            { channelId: "email", enabled: true },
            { channelId: "push", enabled: true },
            { channelId: "sms", enabled: true },
            { channelId: "inApp", enabled: true },
          ],
        },
      ],
    },
    {
      id: "billing",
      name: "Billing & Statements",
      description: "Updates about your regular statements, bills, and account summaries",
      icon: <FileText size={20} />,
      categories: [
        {
          id: "statements",
          name: "Monthly Statements",
          channels: [
            { channelId: "email", enabled: true },
            { channelId: "push", enabled: false },
            { channelId: "sms", enabled: false },
            { channelId: "inApp", enabled: true },
          ],
        },
        {
          id: "billReminders",
          name: "Bill Reminders",
          channels: [
            { channelId: "email", enabled: true },
            { channelId: "push", enabled: true },
            { channelId: "sms", enabled: false },
            { channelId: "inApp", enabled: true },
          ],
        },
      ],
    },
    {
      id: "promotions",
      name: "Offers & Promotions",
      description: "Special offers, promotions, and personalized recommendations",
      icon: <Gift size={20} />,
      categories: [
        {
          id: "specialOffers",
          name: "Special Offers",
          channels: [
            { channelId: "email", enabled: true },
            { channelId: "push", enabled: false },
            { channelId: "sms", enabled: false },
            { channelId: "inApp", enabled: true },
          ],
        },
        {
          id: "productUpdates",
          name: "New Products & Services",
          channels: [
            { channelId: "email", enabled: true },
            { channelId: "push", enabled: false },
            { channelId: "sms", enabled: false },
            { channelId: "inApp", enabled: false },
          ],
        },
      ],
    },
    {
      id: "reminders",
      name: "Reminders & Scheduled Events",
      description: "Reminders about upcoming payments, transfers, and appointments",
      icon: <Calendar size={20} />,
      categories: [
        {
          id: "scheduledPayments",
          name: "Scheduled Payments",
          channels: [
            { channelId: "email", enabled: true },
            { channelId: "push", enabled: true },
            { channelId: "sms", enabled: false },
            { channelId: "inApp", enabled: true },
          ],
        },
        {
          id: "appointments",
          name: "Appointments & Meetings",
          channels: [
            { channelId: "email", enabled: true },
            { channelId: "push", enabled: true },
            { channelId: "sms", enabled: true },
            { channelId: "inApp", enabled: true },
          ],
        },
      ],
    },
    {
      id: "insights",
      name: "Financial Insights",
      description: "Personalized insights about your spending, saving, and financial health",
      icon: <PieChart size={20} />,
      categories: [
        {
          id: "budgetAlerts",
          name: "Budget Alerts",
          channels: [
            { channelId: "email", enabled: true },
            { channelId: "push", enabled: true },
            { channelId: "sms", enabled: false },
            { channelId: "inApp", enabled: true },
          ],
        },
        {
          id: "financialTips",
          name: "Financial Tips & Insights",
          channels: [
            { channelId: "email", enabled: true },
            { channelId: "push", enabled: false },
            { channelId: "sms", enabled: false },
            { channelId: "inApp", enabled: true },
          ],
        },
      ],
    },
  ]);

  // Selected time preferences
  const [timePreferences, setTimePreferences] = useState({
    quietHoursEnabled: true,
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
    timezone: "Europe/Helsinki",
    preferredDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  });

  // User communication frequency preferences
  const [frequency, setFrequency] = useState({
    marketUpdates: "weekly",
    accountSummaries: "monthly",
    promotionalOffers: "monthly",
  });

  // Active tab state and expanded sections
  const [activeTab, setActiveTab] = useState("notifications");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Save changes state
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Toggle channel enabled/disabled
  const toggleChannel = (channelId: string) => {
    setChannels(
      channels.map((channel) =>
        channel.id === channelId ? { ...channel, enabled: !channel.enabled } : channel
      )
    );
    setUnsavedChanges(true);
  };

  // Toggle category channel
  const toggleCategoryChannel = (typeId: string, categoryId: string, channelId: string) => {
    setNotificationTypes(
      notificationTypes.map((type) =>
        type.id === typeId
          ? {
              ...type,
              categories: type.categories.map((category) =>
                category.id === categoryId
                  ? {
                      ...category,
                      channels: category.channels.map((channel) =>
                        channel.channelId === channelId
                          ? { ...channel, enabled: !channel.enabled }
                          : channel
                      ),
                    }
                  : category
              ),
            }
          : type
      )
    );
    setUnsavedChanges(true);
  };

  // Toggle expanded section
  const toggleExpandedSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Toggle all channels for a category
  const toggleAllCategoryChannels = (typeId: string, categoryId: string, enabled: boolean) => {
    setNotificationTypes(
      notificationTypes.map((type) =>
        type.id === typeId
          ? {
              ...type,
              categories: type.categories.map((category) =>
                category.id === categoryId
                  ? {
                      ...category,
                      channels: category.channels.map((channel) => ({
                        ...channel,
                        enabled,
                      })),
                    }
                  : category
              ),
            }
          : type
      )
    );
    setUnsavedChanges(true);
  };

  // Toggle preferred day
  const togglePreferredDay = (day: string) => {
    setTimePreferences((prev) => {
      const updatedDays = prev.preferredDays.includes(day)
        ? prev.preferredDays.filter((d) => d !== day)
        : [...prev.preferredDays, day];
      return {
        ...prev,
        preferredDays: updatedDays,
      };
    });
    setUnsavedChanges(true);
  };

  // Update frequency preference
  const updateFrequency = (key: string, value: string) => {
    setFrequency((prev) => ({
      ...prev,
      [key]: value,
    }));
    setUnsavedChanges(true);
  };

  // Update time preference
  const updateTimePreference = (key: string, value: any) => {
    setTimePreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
    setUnsavedChanges(true);
  };

  // Save all preferences
  const savePreferences = () => {
    // Simulate API call
    setTimeout(() => {
      setSaveSuccess(true);
      setUnsavedChanges(false);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 800);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const expandVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const tabVariants = {
    inactive: { 
      color: "#6B7280", 
      borderColor: "rgba(79,70,229,0)"    // fully transparent indigo
    },
    active: { 
      color: "#4F46E5", 
      borderColor: "rgba(79,70,229,1)",   // fully opaque indigo
      transition: { duration: 0.2 } 
    },
  };

  const saveButtonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 min-h-screen p-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-5xl mx-auto"
      >
        <motion.div 
          variants={itemVariants}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-indigo-900 dark:text-white">Communication Preferences</h1>
            <motion.button
              variants={saveButtonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${unsavedChanges ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gradient-to-r from-indigo-400 to-purple-400'}`}
              onClick={savePreferences}
              disabled={!unsavedChanges}
            >
              <Save size={18} />
              <span>Save Changes</span>
            </motion.button>
          </div>

          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-green-50 dark:bg-green-950/30 border border-green-200 text-green-700 p-4 rounded-lg flex items-center gap-3"
            >
              <CheckCircle size={20} className="text-green-500" />
              <span>Your communication preferences have been successfully updated.</span>
            </motion.div>
          )}

          <div className="flex border-b border-gray-200 dark:border-gray-700 dark:border-gray-700 mb-6">
            <motion.button
              variants={tabVariants}
              animate={activeTab === "notifications" ? "active" : "inactive"}
              className="px-4 py-2 text-sm font-medium border-b-2 mr-4"
              onClick={() => setActiveTab("notifications")}
            >
              Notification Settings
            </motion.button>
            <motion.button
              variants={tabVariants}
              animate={activeTab === "timing" ? "active" : "inactive"}
              className="px-4 py-2 text-sm font-medium border-b-2 mr-4"
              onClick={() => setActiveTab("timing")}
            >
              Timing & Frequency
            </motion.button>
            <motion.button
              variants={tabVariants}
              animate={activeTab === "advanced" ? "active" : "inactive"}
              className="px-4 py-2 text-sm font-medium border-b-2"
              onClick={() => setActiveTab("advanced")}
            >
              Advanced Options
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            <>
            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <motion.div variants={itemVariants} className="mb-8">
                  <h2 className="text-lg font-semibold text-indigo-900 mb-4">Communication Channels</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {channels.map((channel) => (
                      <motion.div
                        key={channel.id}
                        whileHover={{ y: -3, boxShadow: "0 4px 6px rgba(79, 70, 229, 0.1)" }}
                        className={`p-4 rounded-xl flex flex-col items-center ${
                          channel.enabled
                            ? "bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100"
                            : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:border-gray-700"
                        }`}
                      >
                        <div className={`p-3 rounded-full mb-3 ${
                          channel.enabled
                            ? "bg-indigo-100 text-indigo-600"
                            : "bg-gray-200 text-gray-500"
                        }`}>
                          {channel.icon}
                        </div>
                        <h3 className={`font-medium text-sm mb-2 ${
                          channel.enabled ? "text-indigo-900 dark:text-white" : "text-gray-500"
                        }`}>
                          {channel.name}
                        </h3>
                        <button
                          onClick={() => toggleChannel(channel.id)}
                          className={`text-xs font-medium px-3 py-1 rounded-full ${
                            channel.enabled
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {channel.enabled ? "Enabled" : "Disabled"}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <h2 className="text-lg font-semibold text-indigo-900 mb-4">Notification Types</h2>
                  <div className="space-y-4">
                    <LayoutGroup>
                      {notificationTypes.map((type) => (
                        <motion.div
                          layout
                          key={type.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                        >
                          <motion.div
                            layout
                            onClick={() => toggleExpandedSection(type.id)}
                            className="p-4 flex items-center justify-between cursor-pointer bg-white hover:bg-indigo-50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                                {type.icon}
                              </div>
                              <div>
                                <h3 className="font-medium text-indigo-900 dark:text-white">{type.name}</h3>
                                <p className="text-xs text-gray-500">{type.description}</p>
                              </div>
                            </div>
                            <motion.div
                              animate={{ rotate: expandedSections.includes(type.id) ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ChevronDown size={20} className="text-indigo-400" />
                            </motion.div>
                          </motion.div>

                          <AnimatePresence>
                            {expandedSections.includes(type.id) && (
                              <motion.div
                                layout
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                variants={expandVariants}
                                className="border-t border-gray-200 dark:border-gray-700 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 divide-y divide-gray-200"
                              >
                                {type.categories.map((category) => (
                                  <motion.div
                                    layout
                                    key={category.id}
                                    className="p-4"
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200">
                                        {category.name}
                                      </h4>
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => toggleAllCategoryChannels(type.id, category.id, true)}
                                          className="text-xs font-medium bg-indigo-100 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded"
                                        >
                                          Enable All
                                        </button>
                                        <button
                                          onClick={() => toggleAllCategoryChannels(type.id, category.id, false)}
                                          className="text-xs font-medium bg-gray-200 text-gray-700 px-2 py-1 rounded"
                                        >
                                          Disable All
                                        </button>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                      {category.channels.map((channel) => {
                                        const channelInfo = channels.find(
                                          (c) => c.id === channel.channelId
                                        );
                                        return (
                                          <motion.button
                                            key={`${category.id}-${channel.channelId}`}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                              toggleCategoryChannel(
                                                type.id,
                                                category.id,
                                                channel.channelId
                                              )
                                            }
                                            disabled={!channelInfo?.enabled}
                                            className={`p-2 rounded-lg flex items-center justify-between ${
                                              !channelInfo?.enabled
                                                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                                                : channel.enabled
                                                ? "bg-indigo-100 text-indigo-700"
                                                : "bg-white text-gray-700 border border-gray-200 dark:border-gray-700 dark:border-gray-700"
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <div className="text-current">
                                                {channelInfo?.icon}
                                              </div>
                                              <span className="text-xs font-medium">
                                                {channelInfo?.name}
                                              </span>
                                            </div>
                                            {channel.enabled ? (
                                              <CheckCircle
                                                size={16}
                                                className="text-indigo-600"
                                              />
                                            ) : (
                                              <XCircle
                                                size={16}
                                                className="text-gray-400 dark:text-gray-500"
                                              />
                                            )}
                                          </motion.button>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </LayoutGroup>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === "timing" && (
              <motion.div
                key="timing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-indigo-100">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
                      <Clock size={20} className="text-indigo-600" />
                      Quiet Hours
                    </h2>
                    <div className="relative inline-block w-12 h-6">
                      <input
                        type="checkbox"
                        className="opacity-0 w-0 h-0"
                        checked={timePreferences.quietHoursEnabled}
                        onChange={() =>
                          updateTimePreference("quietHoursEnabled", !timePreferences.quietHoursEnabled)
                        }
                        id="quiet-hours-toggle"
                      />
                      <motion.label
                        htmlFor="quiet-hours-toggle"
                        className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full ${
                          timePreferences.quietHoursEnabled
                            ? "bg-indigo-600"
                            : "bg-gray-300"
                        }`}
                        animate={{
                          backgroundColor: timePreferences.quietHoursEnabled
                            ? "#4F46E5"
                            : "#D1D5DB",
                        }}
                      >
                        <motion.span
                          className="absolute bg-white h-5 w-5 rounded-full top-0.5 left-0.5"
                          animate={{
                            left: timePreferences.quietHoursEnabled
                              ? "calc(100% - 20px)"
                              : "2px",
                          }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </motion.label>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    During quiet hours, you'll only receive critical security alerts and urgent notifications.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={timePreferences.quietHoursStart}
                        onChange={(e) =>
                          updateTimePreference("quietHoursStart", e.target.value)
                        }
                        disabled={!timePreferences.quietHoursEnabled}
                        className={`w-full p-2 border rounded-lg ${
                          timePreferences.quietHoursEnabled
                            ? "border-indigo-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                            : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={timePreferences.quietHoursEnd}
                        onChange={(e) =>
                          updateTimePreference("quietHoursEnd", e.target.value)
                        }
                        disabled={!timePreferences.quietHoursEnabled}
                        className={`w-full p-2 border rounded-lg ${
                          timePreferences.quietHoursEnabled
                            ? "border-indigo-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                            : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed"
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-indigo-100">
                  <h2 className="text-lg font-semibold text-indigo-900 flex items-center gap-2 mb-4">
                    <Calendar size={20} className="text-indigo-600" />
                    Preferred Days
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Select days when you prefer to receive non-critical notifications and updates.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(
                      (day) => (
                        <motion.button
                          key={day}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => togglePreferredDay(day)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium capitalize ${
                            timePreferences.preferredDays.includes(day)
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600"
                          }`}
                        >
                          {day.slice(0, 3)}
                        </motion.button>
                      )
                    )}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-indigo-100">
                  <h2 className="text-lg font-semibold text-indigo-900 flex items-center gap-2 mb-4">
                    <Clock size={20} className="text-indigo-600" />
                    Communication Frequency
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose how often you'd like to receive the following types of communications.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                      <h3 className="font-medium text-gray-800 dark:text-gray-200">Market Updates & Insights</h3>
                        <p className="text-xs text-gray-500">Financial news and market trends relevant to your portfolio</p>
                      </div>
                      <select
                        value={frequency.marketUpdates}
                        onChange={(e) => updateFrequency("marketUpdates", e.target.value)}
                        className="p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="never">Never</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-gray-200">Account Summaries</h3>
                        <p className="text-xs text-gray-500">Overviews of your account activity and balance</p>
                      </div>
                      <select
                        value={frequency.accountSummaries}
                        onChange={(e) => updateFrequency("accountSummaries", e.target.value)}
                        className="p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-gray-200">Promotional Offers</h3>
                        <p className="text-xs text-gray-500">Special offers, discounts, and product recommendations</p>
                      </div>
                      <select
                        value={frequency.promotionalOffers}
                        onChange={(e) => updateFrequency("promotionalOffers", e.target.value)}
                        className="p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="never">Never</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === "advanced" && (
              <motion.div
                key="advanced"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-indigo-100">
                  <h2 className="text-lg font-semibold text-indigo-900 flex items-center gap-2 mb-4">
                    <Globe size={20} className="text-indigo-600" />
                    Regional Settings
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={timePreferences.timezone}
                        onChange={(e) => updateTimePreference("timezone", e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                      >
                        <option value="Europe/Helsinki">Europe/Helsinki (GMT+3)</option>
                        <option value="Europe/London">Europe/London (GMT+1)</option>
                        <option value="Europe/Paris">Europe/Paris (GMT+2)</option>
                        <option value="Europe/Stockholm">Europe/Stockholm (GMT+2)</option>
                        <option value="America/New_York">America/New York (GMT-4)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language for Communications
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="p-3 border border-indigo-300 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 rounded-lg flex items-center gap-2"
                        >
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                            <CheckCircle size={14} className="text-indigo-600" />
                          </div>
                          <span>English</span>
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="p-3 border border-gray-200 dark:border-gray-700 bg-white text-gray-700 rounded-lg flex items-center gap-2"
                        >
                          <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full border-2 border-gray-400" />
                          </div>
                          <span>Finnish</span>
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="p-3 border border-gray-200 dark:border-gray-700 bg-white text-gray-700 rounded-lg flex items-center gap-2"
                        >
                          <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full border-2 border-gray-400" />
                          </div>
                          <span>Swedish</span>
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="p-3 border border-gray-200 dark:border-gray-700 bg-white text-gray-700 rounded-lg flex items-center gap-2"
                        >
                          <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full border-2 border-gray-400" />
                          </div>
                          <span>Norwegian</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-indigo-100">
                  <h2 className="text-lg font-semibold text-indigo-900 flex items-center gap-2 mb-4">
                    <AlertTriangle size={20} className="text-indigo-600" />
                    Critical Alerts Override
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    These settings determine what notifications can bypass your quiet hours and other preferences.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 dark:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <Shield size={18} className="text-red-500" />
                        <span className="text-sm font-medium">Security Alerts</span>
                      </div>
                      <div className="text-xs font-medium bg-red-50 dark:bg-red-950/30 text-red-700 px-2 py-1 rounded">
                        Always On
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={18} className="text-amber-500" />
                        <span className="text-sm font-medium">Suspicious Transactions</span>
                      </div>
                      <div className="relative inline-block w-10 h-5">
                        <input
                          type="checkbox"
                          className="opacity-0 w-0 h-0"
                          checked={true}
                          id="suspicious-toggle"
                        />
                        <motion.label
                          htmlFor="suspicious-toggle"
                          className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full bg-indigo-600"
                        >
                          <motion.span
                            className="absolute bg-white h-4 w-4 rounded-full top-0.5 left-0.5"
                            style={{ left: "calc(100% - 18px)" }}
                          />
                        </motion.label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign size={18} className="text-green-500" />
                        <span className="text-sm font-medium">Large Transactions</span>
                      </div>
                      <div className="relative inline-block w-10 h-5">
                        <input
                          type="checkbox"
                          className="opacity-0 w-0 h-0"
                          checked={true}
                          id="large-txn-toggle"
                        />
                        <motion.label
                          htmlFor="large-txn-toggle"
                          className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full bg-indigo-600"
                        >
                          <motion.span
                            className="absolute bg-white h-4 w-4 rounded-full top-0.5 left-0.5"
                            style={{ left: "calc(100% - 18px)" }}
                          />
                        </motion.label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-blue-500" />
                        <span className="text-sm font-medium">Payment Reminders</span>
                      </div>
                      <div className="relative inline-block w-10 h-5">
                        <input
                          type="checkbox"
                          className="opacity-0 w-0 h-0"
                          checked={false}
                          id="payment-toggle"
                        />
                        <motion.label
                          htmlFor="payment-toggle"
                          className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full bg-gray-300"
                        >
                          <motion.span
                            className="absolute bg-white h-4 w-4 rounded-full top-0.5 left-0.5"
                          />
                        </motion.label>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-indigo-100">
                  <h2 className="text-lg font-semibold text-indigo-900 flex items-center gap-2 mb-4">
                    <Info size={20} className="text-indigo-600" />
                    Communication History
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Download your communication history or delete all your communication records.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200"
                    >
                      <FileText size={16} />
                      <span>Export Communication History</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/30 text-red-700 rounded-lg border border-red-200"
                    >
                      <XCircle size={16} />
                      <span>Delete Communication History</span>
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
            </>
          </AnimatePresence>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl p-4 mt-6 flex items-center justify-between text-sm"
        >
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-indigo-600" />
            <span className="text-indigo-900 dark:text-white">Your communication preferences are protected and never shared with third parties.</span>
          </div>
          <motion.button
            whileHover={{ x: 3 }}
            className="text-purple-700 font-medium"
          >
            Privacy Policy
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Communication;