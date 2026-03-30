// ============================================================================
// HERO OVERLAY - Floating banking stats & widgets for the hero carousel
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';

interface HeroOverlayProps {
  slideIndex: number;
}

const HeroOverlay: React.FC<HeroOverlayProps> = ({ slideIndex }) => {
  return (
    <div className="absolute right-0 top-0 bottom-0 z-10 hidden md:block pointer-events-none">
      {/* Right column - stacked stat cards */}
      <div className="absolute right-4 lg:right-10 xl:right-16 top-1/2 -translate-y-1/2 flex flex-col gap-3 lg:gap-4">
        {/* Portfolio Growth */}
        <motion.div
          key={`growth-${slideIndex}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 lg:p-4 border border-white/15 w-48 lg:w-56"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Portfolio Growth</p>
              <p className="text-base lg:text-lg font-bold text-white">+24.8%</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-emerald-400" />
            <span className="text-[11px] text-emerald-400">+3.2% this week</span>
          </div>
        </motion.div>

        {/* Global Transfers */}
        <motion.div
          key={`globe-${slideIndex}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 lg:p-4 border border-white/15 w-48 lg:w-56"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Globe className="w-4 h-4 lg:w-5 lg:h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Global Transfers</p>
              <p className="text-base lg:text-lg font-bold text-white">180+ Countries</p>
            </div>
          </div>
          <div className="flex gap-1.5 mt-1">
            {['\ud83c\uddfa\ud83c\uddf8', '\ud83c\uddec\ud83c\udde7', '\ud83c\uddea\ud83c\uddfa', '\ud83c\uddf3\ud83c\uddec', '\ud83c\uddf0\ud83c\uddea'].map((flag, i) => (
              <span key={i} className="text-sm">{flag}</span>
            ))}
            <span className="text-[11px] text-white/40 ml-0.5">+175</span>
          </div>
        </motion.div>

        {/* Security Level */}
        <motion.div
          key={`shield-${slideIndex}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 lg:p-4 border border-white/15 w-48 lg:w-56"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 lg:w-5 lg:h-5 text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Security Level</p>
              <p className="text-base lg:text-lg font-bold text-white">Bank-Grade</p>
            </div>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '95%' }}
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
          className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 lg:p-4 border border-white/15 w-48 lg:w-56"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-sky-500/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 lg:w-5 lg:h-5 text-sky-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Active Users</p>
              <p className="text-base lg:text-lg font-bold text-white">2.4M+</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex -space-x-1.5">
              {[
                'bg-sky-400', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-400',
              ].map((color, i) => (
                <div key={i} className={`w-5 h-5 rounded-full ${color} border-2 border-white/20`} />
              ))}
            </div>
            <span className="text-[11px] text-white/40 ml-1">+12k today</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom-right floating mini widgets (lg+ only) */}
      <div className="absolute right-4 lg:right-10 xl:right-16 bottom-16 lg:bottom-20 hidden lg:flex gap-3">
        {/* Quick Transfer */}
        <motion.div
          key={`transfer-${slideIndex}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/15 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Banknote className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-wider">Instant Transfer</p>
            <p className="text-sm font-semibold text-white">&lt; 30 seconds</p>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-2" />
        </motion.div>

        {/* Card Rewards */}
        <motion.div
          key={`rewards-${slideIndex}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/15 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-wider">Card Rewards</p>
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
        className="absolute right-4 lg:right-10 xl:right-16 top-24 lg:top-28 hidden xl:flex items-center gap-2.5 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/15"
      >
        <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white">FDIC Insured</p>
          <p className="text-[10px] text-white/40">Up to $250,000</p>
        </div>
        <div className="w-px h-6 bg-white/15 mx-1" />
        <div className="w-7 h-7 rounded-full bg-sky-500/20 flex items-center justify-center">
          <Clock className="w-4 h-4 text-sky-400" />
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
