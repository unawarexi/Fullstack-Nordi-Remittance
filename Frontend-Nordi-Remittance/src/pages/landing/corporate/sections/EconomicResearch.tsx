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
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

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
    <Section id="economic-research" className="py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-4">
            <BarChart3 className="w-4 h-4" />
            Economic Research
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Insights That Drive Decisions
          </h2>
          <p className="text-lg text-neutral-600">
            Expert economic analysis and market research to help you navigate 
            complex business environments and make informed strategic decisions.
          </p>
        </motion.div>

        {/* Research Themes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {researchThemes.map((theme) => (
            <div
              key={theme.name}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl bg-white border border-neutral-200",
                "hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer"
              )}
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <theme.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 text-sm">{theme.name}</p>
                <p className="text-xs text-neutral-500">{theme.count} reports</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Reports List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-neutral-900">Latest Reports</h3>
              <Button variant="ghost" className="text-sm text-indigo-600">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="space-y-4">
              {researchReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={cn(
                    "group flex items-start gap-4 p-4 rounded-xl bg-white border",
                    report.featured ? "border-indigo-300 bg-indigo-50/50" : "border-neutral-200",
                    "hover:shadow-md transition-all cursor-pointer"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                    report.featured ? "bg-indigo-100 text-indigo-600" : "bg-neutral-100 text-neutral-500"
                  )}>
                    <FileText className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", typeBadgeColors[report.type])}>
                        {report.type}
                      </span>
                      <span className="text-xs text-neutral-400">{report.category}</span>
                    </div>
                    <h4 className="font-semibold text-neutral-900 group-hover:text-indigo-600 transition-colors">
                      {report.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {report.date}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    className="p-2 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download className="w-4 h-4 text-indigo-600" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscribe */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl bg-indigo-600 text-white"
            >
              <h4 className="font-semibold mb-2">Subscribe to Research</h4>
              <p className="text-sm text-indigo-100 mb-4">
                Get weekly economic insights and reports delivered to your inbox.
              </p>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 rounded-lg bg-white/20 border border-white/20 text-white placeholder:text-indigo-200 text-sm mb-3"
              />
              <Button variant="primary" className="w-full bg-white text-indigo-600 hover:bg-indigo-50">
                Subscribe
              </Button>
            </motion.div>

            {/* Our Economists */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-xl bg-white border border-neutral-200"
            >
              <h4 className="font-semibold text-neutral-900 mb-4">Our Economists</h4>
              <div className="space-y-4">
                {economists.map((economist) => (
                  <div key={economist.name} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-sm">
                      {economist.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 text-sm">{economist.name}</p>
                      <p className="text-xs text-neutral-500">{economist.role}</p>
                      <p className="text-xs text-indigo-600">{economist.specialty}</p>
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
              className="p-6 rounded-xl bg-slate-900 text-white"
            >
              <div className="flex items-center gap-2 text-amber-400 mb-3">
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium">Upcoming Webinar</span>
              </div>
              <h4 className="font-semibold mb-2">2025 Economic Outlook</h4>
              <p className="text-sm text-slate-300 mb-4">
                Join our chief economist for insights on what to expect in the coming year.
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                <Clock className="w-4 h-4" />
                <span>Jan 15, 2025 • 2:00 PM WAT</span>
              </div>
              <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10 text-sm">
                Register Now
              </Button>
            </motion.div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default EconomicResearch;
