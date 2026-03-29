// ============================================================================
// BRANCH LOCATOR SECTION
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Search,
  Navigation,
  Clock,
  Phone,
  Filter,
  ChevronRight,
  Building2,
  Landmark,
  Users,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// BRANCH DATA
// ========================
interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  hours: string;
  type: "branch" | "digital" | "business";
  services: string[];
}

const branches: Branch[] = [
  {
    id: "1",
    name: "Victoria Island Main",
    address: "1412 Adeola Odeku Street",
    city: "Victoria Island",
    state: "Lagos",
    phone: "+234 1 280 2500",
    hours: "Mon-Fri: 8am-4pm",
    type: "branch",
    services: ["Cash Deposit", "Foreign Exchange", "Corporate Banking"],
  },
  {
    id: "2",
    name: "Ikeja City Mall",
    address: "Obafemi Awolowo Way",
    city: "Ikeja",
    state: "Lagos",
    phone: "+234 1 280 2501",
    hours: "Mon-Sat: 9am-7pm",
    type: "digital",
    services: ["Quick Services", "Card Issuance", "Account Opening"],
  },
  {
    id: "3",
    name: "Abuja Central Business",
    address: "Plot 999 Herbert Macaulay Way",
    city: "Central Area",
    state: "Abuja",
    phone: "+234 9 461 5000",
    hours: "Mon-Fri: 8am-4pm",
    type: "business",
    services: ["Trade Finance", "Corporate Services", "Treasury"],
  },
];

// ========================
// STATS
// ========================
const stats = [
  { icon: Building2, value: "500+", label: "Branches" },
  { icon: Landmark, value: "3,500+", label: "ATMs" },
  { icon: Users, value: "50K+", label: "Agents" },
];

// ========================
// MAIN COMPONENT
// ========================
const BranchLocator: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("all");

  const states = ["all", "Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan"];

  const filteredBranches = branches.filter((branch) => {
    const matchesSearch =
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState =
      selectedState === "all" || branch.state === selectedState;
    return matchesSearch && matchesState;
  });

  const getBranchIcon = (type: Branch["type"]) => {
    switch (type) {
      case "digital":
        return "🌐";
      case "business":
        return "🏢";
      default:
        return "🏦";
    }
  };

  return (
    <Section id="branch-locator" className="py-16 lg:py-24 bg-white dark:bg-neutral-800">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-4">
            <MapPin className="w-4 h-4" />
            Find Us
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Branch & ATM Locator
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            Find the nearest branch, ATM, or agent location. We're closer than you think.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-12"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-xl bg-teal-50">
              <stat.icon className="w-6 h-6 text-teal-600 mx-auto mb-2" />
              <p className="text-xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by branch name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>

            {/* State Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="pl-10 pr-8 py-3 rounded-xl border border-neutral-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none appearance-none bg-white dark:bg-neutral-800 min-w-[160px]"
              >
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state === "all" ? "All States" : state}
                  </option>
                ))}
              </select>
            </div>

            {/* Use Location Button */}
            <Button variant="primary" className="bg-teal-600 hover:bg-teal-700">
              <Navigation className="w-4 h-4 mr-2" />
              Use My Location
            </Button>
          </div>
        </motion.div>

        {/* Map Placeholder & Branch List */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[400px] lg:h-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-700"
          >
            {/* Map Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-teal-300 mx-auto mb-2" />
                <p className="text-neutral-500 dark:text-neutral-400">Interactive Map</p>
                <p className="text-sm text-neutral-400">Click a branch to see location</p>
              </div>
            </div>

            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button className="w-10 h-10 rounded-lg bg-white dark:bg-neutral-800 shadow-md dark:shadow-neutral-900/30 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 dark:bg-neutral-700/50">
                +
              </button>
              <button className="w-10 h-10 rounded-lg bg-white dark:bg-neutral-800 shadow-md dark:shadow-neutral-900/30 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 dark:bg-neutral-700/50">
                −
              </button>
            </div>
          </motion.div>

          {/* Branch List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-3 max-h-[500px] overflow-y-auto pr-2"
          >
            {filteredBranches.map((branch) => (
              <div
                key={branch.id}
                className={cn(
                  "p-4 rounded-xl border border-neutral-200 dark:border-neutral-700",
                  "hover:shadow-md hover:border-teal-300 transition-all cursor-pointer"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getBranchIcon(branch.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-neutral-900 dark:text-white">{branch.name}</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">{branch.address}</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          {branch.city}, {branch.state}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-neutral-400" />
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {branch.hours}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {branch.phone}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {branch.services.slice(0, 3).map((service) => (
                        <span
                          key={service}
                          className="px-2 py-0.5 rounded text-xs bg-teal-50 text-teal-700"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More */}
            <Button variant="outline" className="w-full">
              Load More Branches
            </Button>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export default BranchLocator;
