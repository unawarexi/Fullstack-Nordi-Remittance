// ============================================================================
// CORPORATE FINANCE SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Landmark,
  TrendingUp,
  Building2,
  Globe,
  ArrowRight,
  Check,
  BadgeDollarSign,
  FileText,
  Handshake,
  Scale,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// FINANCING SOLUTIONS
// ========================
interface FinancingSolution {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  typical: string;
}

const financingSolutions: FinancingSolution[] = [
  {
    id: "syndicated",
    name: "Syndicated Loans",
    description: "Large-scale financing through multiple lenders",
    icon: <Handshake className="w-6 h-6" />,
    features: [
      "Lead arranger capabilities",
      "Club deals & broadly syndicated",
      "Flexible tenor structures",
      "Competitive pricing",
    ],
    typical: "$50M - $500M+",
  },
  {
    id: "project",
    name: "Project Finance",
    description: "Non-recourse financing for infrastructure projects",
    icon: <Building2 className="w-6 h-6" />,
    features: [
      "Infrastructure & energy",
      "PPP structures",
      "Long-term debt",
      "Technical advisory",
    ],
    typical: "$100M - $1B+",
  },
  {
    id: "acquisition",
    name: "Acquisition Finance",
    description: "Funding for M&A and corporate transactions",
    icon: <Scale className="w-6 h-6" />,
    features: [
      "Leveraged buyouts",
      "Bridge financing",
      "Stapled financing",
      "Mezzanine structures",
    ],
    typical: "$25M - $500M",
  },
  {
    id: "debt-capital",
    name: "Debt Capital Markets",
    description: "Bond issuance and capital markets access",
    icon: <BadgeDollarSign className="w-6 h-6" />,
    features: [
      "Corporate bonds",
      "Private placements",
      "Green & sustainable bonds",
      "Investor roadshows",
    ],
    typical: "$100M - $1B+",
  },
];

// ========================
// ADVISORY SERVICES
// ========================
const advisoryServices = [
  { icon: FileText, title: "M&A Advisory", description: "Strategic counsel for mergers and acquisitions" },
  { icon: Scale, title: "Restructuring", description: "Financial and operational restructuring" },
  { icon: TrendingUp, title: "Equity Capital", description: "IPO and secondary offerings" },
  { icon: Globe, title: "Cross-Border", description: "International transaction support" },
];

// ========================
// MAIN COMPONENT
// ========================
const CorporateFinance: React.FC = () => {
  return (
    <Section id="corporate-finance" className="py-10 sm:py-16 lg:py-24 bg-slate-50 dark:bg-neutral-900">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12"
        >
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-medium mb-3 sm:mb-4 uppercase tracking-wider">
            <Landmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Corporate Finance
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-2 sm:mb-4 leading-tight">
            Sophisticated Financing Solutions
          </h2>
          <p className="text-sm sm:text-lg text-neutral-600 dark:text-neutral-300 px-4">
            From syndicated loans to debt capital markets, we provide comprehensive 
            corporate finance solutions to support your growth ambitions and strategic initiatives.
          </p>
        </motion.div>

        {/* Financing Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {financingSolutions.map((solution, index) => (
            <motion.div
              key={solution.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={cn(
                "relative p-5 sm:p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                "hover:shadow-lg dark:hover:shadow-neutral-900/50 hover:border-blue-300 transition-all duration-300"
              )}
            >
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  {React.cloneElement(solution.icon as React.ReactElement, { className: "w-5 h-5 sm:w-6 sm:h-6" })}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-1 leading-tight">{solution.name}</h3>
                  <p className="text-[13px] sm:text-sm text-neutral-500 dark:text-neutral-400 mb-3 sm:mb-4 leading-relaxed">{solution.description}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 mb-4 sm:mb-5">
                    {solution.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 shrink-0" />
                        <span className="text-[11px] sm:text-sm text-neutral-600 dark:text-neutral-300 leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>
 
                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-neutral-100 dark:border-neutral-700">
                    <span className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-wider font-medium">Typical Range</span>
                    <span className="text-[13px] sm:text-sm font-bold text-blue-600">{solution.typical}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Advisory Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 sm:p-10 rounded-2xl bg-blue-900 text-white"
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-10">
            <div className="lg:col-span-2">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 leading-tight">Advisory Services</h3>
              <p className="text-sm sm:text-base text-blue-200 mb-6 sm:mb-8 leading-relaxed max-w-lg">
                Our experienced bankers provide strategic advice on complex 
                transactions, helping you navigate the financial landscape 
                and achieve your objectives.
              </p>
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 text-sm py-2.5 px-8">
                Meet Our Team
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
            </div>
            <div className="lg:col-span-3 grid grid-cols-2 gap-3 sm:gap-4">
              {advisoryServices.map((service) => (
                <div
                  key={service.title}
                  className="p-3 sm:p-4 rounded-xl bg-white/10 border border-white/10"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500/30 text-blue-300 flex items-center justify-center mb-3 shrink-0">
                    <service.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h4 className="font-bold text-white text-[13px] sm:text-sm mb-1 leading-tight">{service.title}</h4>
                  <p className="text-[10px] sm:text-xs text-blue-200 mt-0.5 leading-tight">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default CorporateFinance;
