// ============================================================================
// REWARDS SUB-PAGES — My Rewards, Redeem, Offers, Partners
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Gift, Star, Trophy, Crown, Sparkles, Tag, Percent,
  ChevronRight, Clock, CheckCircle2, ArrowRight,
  ShoppingBag, Coffee, Plane, Fuel, Utensils,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { useUIStore } from "@store/ui.store";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// ========================
// MY REWARDS
// ========================
export const MyRewards: React.FC = () => {
  const navigate = useNavigate();
  const show = useUIStore((s) => s.preferences.showBalances);

  const rewardHistory = [
    { title: "Transaction Reward", points: 50, date: "2024-01-28", type: "earned" },
    { title: "Referral Bonus", points: 200, date: "2024-01-25", type: "earned" },
    { title: "Amazon Gift Card", points: -500, date: "2024-01-20", type: "redeemed" },
    { title: "Bill Pay Bonus", points: 25, date: "2024-01-18", type: "earned" },
    { title: "Monthly Bonus", points: 100, date: "2024-01-15", type: "earned" },
  ];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="My Rewards" subtitle="Track and manage your reward points"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Rewards", href: "/customer/rewards" }, { label: "Overview" }]} />
      </motion.div>

      <motion.div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-6 max-w-4xl" variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-sm mb-1">Available Points</p>
            <p className="text-5xl font-bold">{show ? "2,450" : "••••"}</p>
            <p className="text-indigo-200 text-sm mt-2">≈ ${show ? "24.50" : "••••"} value</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2"><Crown size={20} className="text-amber-300" /><span className="text-lg font-semibold">Gold Member</span></div>
            <p className="text-indigo-200 text-sm">550 pts to Platinum</p>
            <div className="w-32 bg-white/20 rounded-full h-2 mt-2"><div className="w-3/4 bg-amber-300 rounded-full h-2" /></div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <motion.button onClick={() => navigate("/customer/rewards/redeem")} className="px-5 py-2.5 bg-white text-indigo-700 rounded-xl text-sm font-semibold" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            Redeem Points
          </motion.button>
          <motion.button onClick={() => navigate("/customer/rewards/offers")} className="px-5 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl text-sm font-semibold" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            View Offers
          </motion.button>
        </div>
      </motion.div>

      <motion.div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-4xl" variants={itemVariants}>
        <div className="p-5 border-b border-gray-100"><h3 className="font-semibold text-indigo-900">Recent Activity</h3></div>
        <div className="divide-y divide-gray-50">
          {rewardHistory.map((item, i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.type === "earned" ? "bg-emerald-50 text-emerald-600" : "bg-purple-50 text-purple-600"}`}>
                  {item.type === "earned" ? <Star size={16} /> : <Gift size={16} />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`text-sm font-bold ${item.points > 0 ? "text-emerald-600" : "text-purple-600"}`}>
                {item.points > 0 ? "+" : ""}{item.points} pts
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ========================
// REDEEM POINTS
// ========================
export const RedeemPoints: React.FC = () => {
  const redemptions = [
    { name: "$10 Amazon Gift Card", points: 1000, category: "Gift Cards", image: "🛒" },
    { name: "$25 Starbucks Card", points: 2500, category: "Gift Cards", image: "☕" },
    { name: "Flight Miles (500)", points: 1500, category: "Travel", image: "✈️" },
    { name: "1% Cashback Boost", points: 500, category: "Banking", image: "💰" },
    { name: "$5 Account Credit", points: 500, category: "Banking", image: "🏦" },
    { name: "Movie Tickets (2)", points: 800, category: "Entertainment", image: "🎬" },
    { name: "$50 Fuel Card", points: 5000, category: "Fuel", image: "⛽" },
    { name: "Premium Support (1yr)", points: 3000, category: "Banking", image: "⭐" },
  ];

  const [filter, setFilter] = useState("all");
  const categories = ["all", "Gift Cards", "Travel", "Banking", "Entertainment", "Fuel"];
  const filtered = filter === "all" ? redemptions : redemptions.filter((r) => r.category === filter);

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Redeem Points" subtitle="Exchange your points for rewards"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Rewards", href: "/customer/rewards" }, { label: "Redeem" }]} />
      </motion.div>

      <motion.div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-2" variants={itemVariants}>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${filter === cat ? "bg-indigo-100 text-indigo-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}>{cat}</button>
        ))}
      </motion.div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={containerVariants}>
        {filtered.map((item, i) => (
          <motion.div key={i} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow" variants={itemVariants} whileHover={{ y: -3 }}>
            <div className="text-4xl mb-3">{item.image}</div>
            <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{item.category}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm font-bold text-indigo-600">{item.points.toLocaleString()} pts</span>
              <motion.button className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-xs font-medium" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Redeem</motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

// ========================
// SPECIAL OFFERS
// ========================
export const SpecialOffers: React.FC = () => {
  const offers = [
    { title: "Double Points Weekend", desc: "Earn 2x points on all transactions this weekend", discount: "2X Points", expiry: "Feb 4, 2024", color: "from-indigo-500 to-purple-600" },
    { title: "20% Off at Partners", desc: "Save 20% at select partner restaurants", discount: "20% OFF", expiry: "Feb 28, 2024", color: "from-emerald-500 to-teal-600" },
    { title: "Free International Transfer", desc: "Zero fees on your next international transfer", discount: "$0 Fees", expiry: "Feb 15, 2024", color: "from-blue-500 to-cyan-600" },
    { title: "Premium Card Upgrade", desc: "Upgrade to platinum for half the annual fee", discount: "50% OFF", expiry: "Mar 1, 2024", color: "from-amber-500 to-orange-600" },
  ];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Special Offers" subtitle="Exclusive deals just for you"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Rewards", href: "/customer/rewards" }, { label: "Offers" }]} />
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl" variants={containerVariants}>
        {offers.map((offer, i) => (
          <motion.div key={i} className={`bg-gradient-to-br ${offer.color} rounded-xl p-6 text-white`} variants={itemVariants} whileHover={{ y: -3, scale: 1.01 }}>
            <div className="flex items-start justify-between mb-4">
              <Sparkles size={24} />
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">{offer.discount}</span>
            </div>
            <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
            <p className="text-sm text-white/80 mb-4">{offer.desc}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Expires: {offer.expiry}</span>
              <motion.button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors" whileTap={{ scale: 0.95 }}>
                Claim
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

// ========================
// PARTNER DISCOUNTS
// ========================
export const PartnerDiscounts: React.FC = () => {
  const partners = [
    { name: "Amazon", category: "Shopping", discount: "Up to 5% cashback", logo: "🛒", color: "bg-orange-50" },
    { name: "Starbucks", category: "Coffee & Dining", discount: "10% off all orders", logo: "☕", color: "bg-emerald-50" },
    { name: "Uber", category: "Transportation", discount: "15% off rides", logo: "🚗", color: "bg-gray-50" },
    { name: "Netflix", category: "Entertainment", discount: "1 month free", logo: "🎬", color: "bg-red-50" },
    { name: "Nike", category: "Shopping", discount: "20% off online", logo: "👟", color: "bg-gray-50" },
    { name: "Airbnb", category: "Travel", discount: "$25 off first stay", logo: "🏠", color: "bg-pink-50" },
    { name: "Shell", category: "Fuel", discount: "3¢ off per gallon", logo: "⛽", color: "bg-amber-50" },
    { name: "Spotify", category: "Entertainment", discount: "3 months 50% off", logo: "🎵", color: "bg-green-50" },
  ];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Partner Discounts" subtitle="Exclusive discounts from our partners"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Rewards", href: "/customer/rewards" }, { label: "Partners" }]} />
      </motion.div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" variants={containerVariants}>
        {partners.map((p, i) => (
          <motion.div key={i} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer" variants={itemVariants} whileHover={{ y: -3 }}>
            <div className={`w-14 h-14 ${p.color} rounded-xl flex items-center justify-center text-2xl mb-3`}>{p.logo}</div>
            <h3 className="font-semibold text-gray-900">{p.name}</h3>
            <p className="text-xs text-gray-500">{p.category}</p>
            <div className="mt-3 px-3 py-1.5 bg-indigo-50 rounded-lg">
              <p className="text-xs font-semibold text-indigo-700">{p.discount}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};
