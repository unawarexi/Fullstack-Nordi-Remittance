// ============================================================================
// CUSTOMER FEEDBACK SECTION
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Star,
  Send,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Smile,
  Frown,
  Check,
  ArrowRight,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// FEEDBACK CATEGORIES
// ========================
const feedbackCategories = [
  "General Feedback",
  "Service Quality",
  "Product Suggestion",
  "Branch Experience",
  "Digital Banking",
  "Complaint",
];

// ========================
// SATISFACTION OPTIONS
// ========================
const satisfactionOptions = [
  { icon: Frown, label: "Very Unhappy", value: 1, color: "text-red-500" },
  { icon: Meh, label: "Unhappy", value: 2, color: "text-orange-500" },
  { icon: Smile, label: "Neutral", value: 3, color: "text-amber-500" },
  { icon: ThumbsUp, label: "Happy", value: 4, color: "text-lime-500" },
  { icon: Star, label: "Very Happy", value: 5, color: "text-emerald-500" },
];

// ========================
// STATS
// ========================
const feedbackStats = [
  { value: "95%", label: "Resolution Rate" },
  { value: "24hrs", label: "Avg Response Time" },
  { value: "4.6/5", label: "Customer Rating" },
];

// ========================
// MAIN COMPONENT
// ========================
const CustomerFeedback: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSatisfaction, setSelectedSatisfaction] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({ selectedCategory, selectedSatisfaction, feedback });
  };

  return (
    <Section id="customer-feedback" className="py-16 lg:py-24 bg-white dark:bg-neutral-800">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-800/30 text-indigo-700 text-sm font-medium mb-4">
            <MessageSquare className="w-4 h-4" />
            Feedback
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Your Voice Matters
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            We continuously improve based on your feedback. Share your thoughts, 
            suggestions, or concerns and help us serve you better.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto mb-12 sm:mb-20"
        >
          {feedbackStats.map((stat) => (
            <div key={stat.label} className="text-center p-4 sm:p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 shadow-sm hover:shadow-xl transition-all">
              <p className="text-xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums tracking-tighter italic">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Feedback Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
            {/* Category Selection */}
            <div className="mb-8">
              <label className="block text-[10px] sm:text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">
                Transmission Source
              </label>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {feedbackCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "px-5 py-2.5 rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-tight transition-all duration-300",
                      selectedCategory === category
                        ? "bg-indigo-600 text-white shadow-xl scale-105"
                        : "bg-white dark:bg-neutral-800 border-2 border-neutral-100 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-indigo-500/30"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Satisfaction Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-2">
                How satisfied are you with our services?
              </label>
              <div className="flex justify-between gap-2">
                {satisfactionOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedSatisfaction(option.value)}
                    className={cn(
                      "flex-1 p-3 rounded-xl flex flex-col items-center gap-1 transition-all",
                      selectedSatisfaction === option.value
                        ? "bg-indigo-100 dark:bg-indigo-800/30 border-2 border-indigo-500"
                        : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-indigo-300"
                    )}
                  >
                    <option.icon className={cn("w-8 h-8", option.color)} />
                    <span className="text-xs text-neutral-600 dark:text-neutral-300">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Text */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-2">
                Share your thoughts
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what we did well, what could be improved, or any suggestions you have..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
              />
            </div>

            {/* Contact Info (Optional) */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-2">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Feedback
            </Button>

            {/* Privacy Note */}
            <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-4">
              Your feedback is confidential. We only use it to improve our services.
            </p>
          </form>
        </motion.div>

        {/* Recent Updates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 max-w-2xl mx-auto"
        >
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 text-center">
            Recent Improvements Based on Your Feedback
          </h3>
          <div className="space-y-3">
            {[
              "Reduced mobile app login time by 50%",
              "Extended branch hours in major cities",
              "Simplified international transfer process",
              "Added more ATM locations nationwide",
            ].map((improvement, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200"
              >
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="text-neutral-700 dark:text-neutral-200">{improvement}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default CustomerFeedback;
