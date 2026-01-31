import React, { useState } from "react";
import { motion } from "framer-motion";
import TransactionHistory from "@pages/admin/components/TransferHistory";
import { 
  Send, 
  Receipt, 
  ArrowDownCircle, 
  Repeat, 
  QrCode,
  Filter,
  Calendar,

  ChevronRight
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Sample data for spending chart
const spendingData = [
  { category: "Food & Dining", amount: 430, color: "#4f46e5" },  // indigo-600
  { category: "Shopping", amount: 320, color: "#7e22ce" },       // purple-700
  { category: "Housing", amount: 1200, color: "#db2777" },       // pink-600
  { category: "Transportation", amount: 180, color: "#0891b2" }, // cyan-600
  { category: "Entertainment", amount: 145, color: "#f59e0b" },  // amber-500
  { category: "Healthcare", amount: 95, color: "#059669" }       // emerald-600
];

// Sample data for spending trend (last 6 months)
const spendingTrendData = [
  { month: "Jan", spent: 900 },
  { month: "Feb", spent: 1100 },
  { month: "Mar", spent: 950 },
  { month: "Apr", spent: 1200 },
  { month: "May", spent: 1050 },
  { month: "Jun", spent: 1300 },
];

// Quick action items
const quickActions = [
  { 
    title: "Send Money", 
    icon: <Send size={20} />, 
    color: "bg-indigo-100 text-indigo-600", 
    hoverColor: "hover:bg-indigo-200" 
  },
  { 
    title: "Pay Bills", 
    icon: <Receipt size={20} />, 
    color: "bg-purple-100 text-purple-600", 
    hoverColor: "hover:bg-purple-200" 
  },
  { 
    title: "Deposit", 
    icon: <ArrowDownCircle size={20} />, 
    color: "bg-pink-100 text-pink-600", 
    hoverColor: "hover:bg-pink-200" 
  },
  { 
    title: "Exchange", 
    icon: <Repeat size={20} />, 
    color: "bg-blue-100 text-blue-600", 
    hoverColor: "hover:bg-blue-200" 
  },
  { 
    title: "Request", 
    icon: <QrCode size={20} />, 
    color: "bg-amber-100 text-amber-600", 
    hoverColor: "hover:bg-amber-200" 
  }
];

// Filter options for spending analytics
const filterOptions = ["Week", "Month", "Quarter", "Year"];

const DashboardMain: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState("Month");
  const [isSpendingExpanded, setIsSpendingExpanded] = useState(false);
  
  // Calculate total spending
  const totalSpending = spendingData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="flex-1">
      {/* Quick Actions */}
      <motion.div 
        className="bg-white rounded-xl shadow-sm p-4 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-indigo-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-5 gap-2 sm:gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              className={`flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer transition-all ${action.color} ${action.hoverColor}`}
              whileHover={{ y: -3, boxShadow: "0 4px 12px rgba(79, 70, 229, 0.15)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: 0.1 + (index * 0.05), duration: 0.3 } 
              }}
            >
              {action.icon}
              <span className="text-sm mt-2 font-medium">{action.title}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div 
        className="bg-white rounded-xl shadow-sm p-4 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-indigo-900">Recent Transactions</h2>
            <p className="text-sm text-purple-500">Activity from the last 30 days</p>
          </div>
          <motion.button
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
            whileHover={{ x: 3 }}
          >
            View All <ChevronRight size={16} />
          </motion.button>
        </div>
        
        {/* Imported Transaction History Component */}
        <TransactionHistory />
      </motion.div>

      {/* Spending Analytics */}
      <motion.div 
        className="bg-white rounded-xl shadow-sm p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-indigo-900">Spending Analytics</h2>
            <p className="text-sm text-purple-500">How you're spending your money</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-indigo-500" />
            <div className="flex bg-indigo-50 rounded-lg p-1">
              {filterOptions.map(option => (
                <button
                  key={option}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                    activeFilter === option
                      ? "bg-indigo-600 text-white"
                      : "text-indigo-600 hover:bg-indigo-100"
                  }`}
                  onClick={() => setActiveFilter(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap">
          {/* Spending Chart */}
          <div className="w-full md:w-5/12 mb-4 md:mb-0">
            <div className="aspect-square relative">
              {/* Pie Chart for Spending */}
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={spendingData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="90%"
                    paddingAngle={2}
                    labelLine={false}
                    label={({ percent }) =>
                      percent > 0.08
                        ? `${(percent * 100).toFixed(0)}%`
                        : ""
                    }
                  >
                    {spendingData.map((entry, idx) => (
                      <Cell key={entry.category} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`$${value}`, name]}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </RechartsPie>
              </ResponsiveContainer>
              {/* Centered total */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-sm text-purple-500">Total Spent</p>
                <p className="text-2xl font-bold text-indigo-900">${totalSpending}</p>
                <p className="text-xs text-gray-500">{activeFilter}</p>
              </div>
            </div>
          </div>
          
          {/* Spending Categories */}
          <div className="w-full md:w-7/12 pl-0 md:pl-6">
            <motion.div 
              className="space-y-3"
              animate={{ height: isSpendingExpanded ? "auto" : "250px" }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
            >
              {spendingData.map((item, index) => {
                const percentage = ((item.amount / totalSpending) * 100).toFixed(1);
                
                return (
                  <motion.div 
                    key={item.category}
                    className="bg-white border border-indigo-50 rounded-lg p-3 hover:shadow-sm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ 
                      opacity: 1,
                      x: 0,
                      transition: { delay: 0.1 + (index * 0.05), duration: 0.3 }
                    }}
                    whileHover={{ x: 3 }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <p className="font-medium text-indigo-900">{item.category}</p>
                      </div>
                      <p className="font-semibold text-indigo-900">${item.amount}</p>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <motion.div 
                        className="h-1.5 rounded-full" 
                        style={{ 
                          backgroundColor: item.color,
                          width: `${percentage}%` 
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.3 + (index * 0.05) }}
                      ></motion.div>
                    </div>
                    <p className="text-xs text-right mt-1 text-gray-500">{percentage}%</p>
                  </motion.div>
                );
              })}
            </motion.div>
            
            {!isSpendingExpanded && spendingData.length > 4 && (
              <motion.button
                className="w-full text-center text-sm text-purple-600 mt-3 hover:text-purple-800"
                whileHover={{ scale: 1.02 }}
                onClick={() => setIsSpendingExpanded(true)}
              >
                View All Categories
              </motion.button>
            )}
          </div>
        </div>
        
        {/* Trendline Section */}
        <div className="mt-20 pt-4 border-t border-indigo-50 ">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-indigo-900">Spending Trend</h3>
            <div className="flex items-center gap-2 text-xs text-purple-500">
              <Calendar size={14} />
              <span>Last 6 months</span>
            </div>
          </div>
          
          {/* Area Chart for Spending Trend */}
          <div className="h-40 bg-indigo-50 rounded-lg flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendingTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="month" tick={{ fill: "#6366f1", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6366f1", fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [`$${value}`, "Spent"]} />
                <Area
                  type="monotone"
                  dataKey="spent"
                  stroke="#4f46e5"
                  fillOpacity={1}
                  fill="url(#colorSpent)"
                  activeDot={{ r: 6, fill: "#7e22ce", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardMain;