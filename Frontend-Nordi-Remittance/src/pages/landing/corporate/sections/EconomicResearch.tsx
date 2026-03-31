// ============================================================================
// ECONOMIC RESEARCH SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  FileText,
  Calendar,
  ArrowRight,
  Download,
  Globe,
  Building2,
  Leaf,
  Users,
  Clock,
  Mail,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button, IconButton } from "@components/ui/Button";

// ========================
// RESEARCH REPORTS
// ========================
interface ResearchReport {
  id: string;
  title: string;
  category: string;
  date: string;
  type: "report" | "brief" | "outlook";
  featured?: boolean;
}

const researchReports: ResearchReport[] = [
  {
    id: "1",
    title: "Nigeria Economic Outlook Q4 2024",
    category: "Macro Economics",
    date: "Dec 2024",
    type: "outlook",
    featured: true,
  },
  {
    id: "2",
    title: "FX Market Analysis & Forecast",
    category: "Currency Markets",
    date: "Nov 2024",
    type: "report",
  },
  {
    id: "3",
    title: "Oil & Gas Sector Review",
    category: "Industry Analysis",
    date: "Nov 2024",
    type: "report",
  },
  {
    id: "4",
    title: "Inflation & Monetary Policy Brief",
    category: "Monetary Policy",
    date: "Nov 2024",
    type: "brief",
  },
  {
    id: "5",
    title: "Real Estate Market Update",
    category: "Property Markets",
    date: "Oct 2024",
    type: "report",
  },
  {
    id: "6",
    title: "Sub-Saharan Africa Growth Prospects",
    category: "Regional Analysis",
    date: "Oct 2024",
    type: "outlook",
  },
];

// ========================
// RESEARCH THEMES
// ========================
const researchThemes = [
  { icon: TrendingUp, name: "Economic Indicators", count: 45 },
  { icon: Globe, name: "Global Markets", count: 32 },
  { icon: Building2, name: "Industry Analysis", count: 28 },
  { icon: Leaf, name: "ESG & Sustainability", count: 15 },
];

// ========================
// ECONOMISTS
// ========================
const economists = [
  { name: "Dr. Amaka Okonkwo", role: "Chief Economist", specialty: "Macro Economics" },
  { name: "Samuel Adeyemi", role: "Senior Analyst", specialty: "Currency Markets" },
  { name: "Fatima Bello", role: "Research Director", specialty: "Industry Analysis" },
];

// ========================
// TYPE BADGE COLORS
// ========================
const typeBadgeColors = {
  report: "bg-blue-100 text-blue-700",
  brief: "bg-emerald-100 text-emerald-700",
  outlook: "bg-violet-100 text-violet-700",
};

// ========================
// MAIN COMPONENT
// ========================
const EconomicResearch: React.FC = () => {
  return (
    <Section id="economic-research" className="py-10 sm:py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12"
        >
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-indigo-100 dark:bg-indigo-800/30 text-indigo-700 text-[10px] sm:text-xs font-medium mb-3 sm:mb-4 uppercase tracking-wider">
            <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Economic Research
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-2 sm:mb-4 leading-tight">
            Insights That Drive Decisions
          </h2>
          <p className="text-sm sm:text-lg text-neutral-600 dark:text-neutral-300 px-4">
            Expert economic analysis and market research to help you navigate 
            complex business environments and make informed strategic decisions.
          </p>
        </motion.div>

        {/* Research Themes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-12"
        >
          {researchThemes.map((theme) => (
            <div
              key={theme.name}
              className={cn(
                "flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                "hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group"
              )}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 dark:bg-indigo-800/30 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <theme.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="font-bold text-neutral-900 dark:text-white text-[11px] sm:text-sm leading-tight">{theme.name}</p>
                <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-tight">{theme.count} reports</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Reports List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">Latest Reports</h3>
              <Button variant="ghost" className="text-sm text-indigo-600">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {researchReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={cn(
                    "group flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white dark:bg-neutral-800 border",
                    report.featured ? "border-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/10" : "border-neutral-200 dark:border-neutral-700",
                    "hover:shadow-md transition-all cursor-pointer"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                    report.featured ? "bg-indigo-100 dark:bg-indigo-800/30 text-indigo-600" : "bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                  )}>
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0 font-medium">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5">
                      <span className={cn("px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider", typeBadgeColors[report.type])}>
                        {report.type}
                      </span>
                      <span className="text-[10px] sm:text-xs text-neutral-400">{report.category}</span>
                    </div>
                    <h4 className="text-[13px] sm:text-base font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 transition-colors leading-tight">
                      {report.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {report.date}
                    </div>
                  </div>

                  <IconButton
                    variant="ghost"
                    size="sm"
                    icon={<Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />}
                    className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Download report"
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 sm:space-y-8">
            {/* Subscribe */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-5 sm:p-6 rounded-2xl bg-indigo-600 text-white"
            >
              <Mail className="w-6 h-6 sm:w-8 sm:h-8 mb-3 sm:mb-4" />
              <h4 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2 leading-tight">Expert Analysis to Your Inbox</h4>
              <p className="text-[13px] sm:text-sm text-indigo-100 mb-5 sm:mb-6 leading-relaxed">
                Subscribe to our weekly economic briefing and never miss a market move.
              </p>
              <div className="space-y-2.5 sm:space-y-3">
                <input
                  type="email"
                  placeholder="Official Email"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
                />
                <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-sm py-2.5">
                  Subscribe Now
                </Button>
              </div>
            </motion.div>

            {/* Our Economists */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
            >
              <h4 className="font-bold text-neutral-900 dark:text-white mb-4 sm:mb-6 text-sm sm:text-base uppercase tracking-wider">Our Lead Economists</h4>
              <div className="space-y-4 sm:space-y-6">
                {economists.map((economist) => (
                  <div key={economist.name} className="flex items-center gap-3 sm:gap-4 group cursor-pointer">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-100 dark:bg-neutral-700 overflow-hidden border-2 border-transparent group-hover:border-indigo-500 transition-all">
                      <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                        {economist.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <div>
                      <p className="text-[13px] sm:text-sm font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 transition-colors leading-tight">{economist.name}</p>
                      <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-tight">{economist.role}</p>
                      <p className="text-[10px] sm:text-xs text-indigo-500 font-semibold mt-0.5 uppercase tracking-wider">{economist.specialty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Webinar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-5 sm:p-6 rounded-2xl bg-neutral-900 text-white border border-neutral-800"
            >
              <div className="flex items-center gap-2 text-indigo-400 mb-3 sm:mb-4">
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Upcoming Webinar</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold mb-3 sm:mb-4 leading-tight">Q2 2024 Macroeconomic Outlook: Navigating Volatility</h4>
              <div className="flex items-center gap-3 mb-5 sm:mb-6 text-[10px] sm:text-xs text-neutral-400 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                Nov 15, 2024 • 10:00 AM WAT
              </div>
              <Button variant="outline" className="w-full border-neutral-700 text-white hover:bg-neutral-800 text-xs py-2">
                Register for Free
              </Button>
            </motion.div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default EconomicResearch;
