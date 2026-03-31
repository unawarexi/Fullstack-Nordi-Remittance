// ============================================================================
// HERO OVERLAY - Floating banking stats & widgets for the hero carousel
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Shield,
  Globe,
  ArrowUpRight,
  Wallet,
  Users,
  Banknote,
  CreditCard,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface HeroOverlayProps {
  slideIndex: number;
}

const HeroOverlay: React.FC<HeroOverlayProps> = ({ slideIndex }) => {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden lg:z-10">
      {/* Right column - stacked stat cards */}
      <div className="absolute right-3 top-1/4 flex -translate-y-1/4 flex-col items-end gap-2 sm:right-4 sm:top-1/2 sm:-translate-y-1/2 sm:gap-3 lg:right-10 lg:gap-4 xl:right-16">
        {/* Portfolio Growth */}
        <motion.div
          key={`growth-${slideIndex}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-[140px] rounded-lg border border-white/15 bg-white/10 p-2 backdrop-blur-md sm:w-48 sm:rounded-xl sm:p-3.5 lg:w-56 lg:p-4"
        >
          <div className="mb-1 flex items-center gap-1.5 sm:mb-2 sm:gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-emerald-500/20 sm:h-8 sm:w-8 sm:rounded-lg lg:h-9 lg:w-9">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[7.5px] uppercase tracking-wider text-white/50 sm:text-[10px]">Portfolio Growth</p>
              <p className="text-xs font-bold text-white sm:text-base lg:text-lg">+24.8%</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <ArrowUpRight className="h-2.5 w-2.5 text-emerald-400 sm:h-3 sm:w-3" />
            <span className="text-[8.5px] text-emerald-400 sm:text-[11px]">+3.2% this week</span>
          </div>
        </motion.div>

        {/* Global Transfers */}
        <motion.div
          key={`globe-${slideIndex}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="hidden w-[140px] rounded-lg border border-white/15 bg-white/10 p-2 backdrop-blur-md sm:block sm:w-48 sm:rounded-xl sm:p-3.5 lg:w-56 lg:p-4"
        >
          <div className="mb-1 flex items-center gap-1.5 sm:mb-2 sm:gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-amber-500/20 sm:h-8 sm:w-8 sm:rounded-lg lg:h-9 lg:w-9">
              <Globe className="h-3.5 w-3.5 text-amber-400 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-white/50">Global Transfers</p>
              <p className="text-base font-bold text-white lg:text-lg">180+ Countries</p>
            </div>
          </div>
          <div className="mt-1 flex gap-1.5">
            {[
              "\ud83c\uddfa\ud83c\uddf8",
              "\ud83c\uddec\ud83c\udde7",
              "\ud83c\uddea\ud83c\uddfa",
              "\ud83c\uddf3\ud83c\uddec",
              "\ud83c\uddf0\ud83c\uddea",
            ].map((flag, i) => (
              <span key={i} className="text-sm">
                {flag}
              </span>
            ))}
            <span className="ml-0.5 text-[11px] text-white/40">+175</span>
          </div>
        </motion.div>

        {/* Security Level */}
        <motion.div
          key={`shield-${slideIndex}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="w-[140px] rounded-lg border border-white/15 bg-white/10 p-2 backdrop-blur-md sm:w-48 sm:rounded-xl sm:p-3.5 lg:w-56 lg:p-4"
        >
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-violet-500/20 sm:h-8 sm:w-8 sm:rounded-lg lg:h-9 lg:w-9">
              <Shield className="h-3.5 w-3.5 text-violet-400 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[7.5px] uppercase tracking-wider text-white/50 sm:text-[10px]">Security Level</p>
              <p className="text-xs font-bold text-white sm:text-base lg:text-lg">Bank-Grade</p>
            </div>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10 sm:mt-2 sm:h-1.5">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "95%" }}
              transition={{ duration: 1.2, delay: 1 }}
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400"
            />
          </div>
        </motion.div>

        {/* Active Users */}
        <motion.div
          key={`users-${slideIndex}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="hidden w-[140px] rounded-lg border border-white/15 bg-white/10 p-2 backdrop-blur-md sm:block sm:w-48 sm:rounded-xl sm:p-3.5 lg:w-56 lg:p-4"
        >
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-sky-500/20 sm:h-8 sm:w-8 sm:rounded-lg lg:h-9 lg:w-9">
              <Users className="h-3.5 w-3.5 text-sky-400 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-white/50">Active Users</p>
              <p className="text-base font-bold text-white lg:text-lg">2.4M+</p>
            </div>
          </div>
          <div className="mt-1.5 flex items-center gap-1">
            <div className="flex -space-x-1.5">
              {["bg-sky-400", "bg-emerald-400", "bg-amber-400", "bg-rose-400"].map((color, i) => (
                <div key={i} className={`h-5 w-5 rounded-full ${color} border-2 border-white/20`} />
              ))}
            </div>
            <span className="ml-1 text-[11px] text-white/40">+12k today</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom-right floating mini widgets (lg+ only) */}
      <div className="absolute bottom-16 right-4 hidden gap-3 lg:bottom-20 lg:right-10 lg:flex xl:right-16">
        {/* Quick Transfer */}
        <motion.div
          key={`transfer-${slideIndex}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
            <Banknote className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/50">Instant Transfer</p>
            <p className="text-sm font-semibold text-white">&lt; 30 seconds</p>
          </div>
          <CheckCircle2 className="ml-2 h-4 w-4 text-emerald-400" />
        </motion.div>

        {/* Card Rewards */}
        <motion.div
          key={`rewards-${slideIndex}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
            <CreditCard className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/50">Card Rewards</p>
            <p className="text-sm font-semibold text-white">Up to 5% back</p>
          </div>
        </motion.div>
      </div>

      {/* Top-right trust badge (xl+ only) */}
      <motion.div
        key={`badge-${slideIndex}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 1.5 }}
        className="absolute right-4 top-24 hidden items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md lg:right-10 lg:top-28 xl:right-16 xl:flex"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white">FDIC Insured</p>
          <p className="text-[10px] text-white/40">Up to $250,000</p>
        </div>
        <div className="mx-1 h-6 w-px bg-white/15" />
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20">
          <Clock className="h-4 w-4 text-sky-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white">24/7 Support</p>
          <p className="text-[10px] text-white/40">Always here</p>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroOverlay;
