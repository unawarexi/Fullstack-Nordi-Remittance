import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  FileClock,
  Activity,
  Globe,
  Calendar,
  PieChart,
  BarChart2,
  LineChart,
  UserCheck,
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
import TransactionHistory from "./TransferHistory";

// Sample data for charts
const revenueData = [
  { name: "Jan", value: 1200 },
  { name: "Feb", value: 1900 },
  { name: "Mar", value: 1500 },
  { name: "Apr", value: 2400 },
  { name: "May", value: 2800 },
  { name: "Jun", value: 3200 },
  { name: "Jul", value: 3800 },
];

const transactionData = [
  { name: "Mon", value: 120 },
  { name: "Tue", value: 150 },
  { name: "Wed", value: 180 },
  { name: "Thu", value: 110 },
  { name: "Fri", value: 210 },
  { name: "Sat", value: 90 },
  { name: "Sun", value: 70 },
];

const pieData = [
  { name: "Savings", value: 450 },
  { name: "Loans", value: 300 },
  { name: "Mortgages", value: 550 },
  { name: "Investments", value: 200 },
];

const userActivityData = [
  { name: "Week 1", mobile: 320, web: 240, branch: 100 },
  { name: "Week 2", mobile: 380, web: 250, branch: 90 },
  { name: "Week 3", mobile: 400, web: 230, branch: 110 },
  { name: "Week 4", mobile: 430, web: 280, branch: 85 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const alerts = [
  { id: 1, title: "Unusual activity detected", severity: "high", time: "10:23" },
  { id: 2, title: "System maintenance scheduled", severity: "medium", time: "14:00" },
  { id: 3, title: "Rate change notification", severity: "low", time: "Yesterday" },
];

const pendingApprovals = [
  { id: 1, user: "Anna Johansson", type: "Loan Application", time: "1h ago" },
  { id: 2, user: "Erik Lundgren", type: "Account Upgrade", time: "3h ago" },
  { id: 3, user: "Sofia Bergman", type: "International Transfer", time: "5h ago" },
];

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
  exit: {
    opacity: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
  exit: { y: -20, opacity: 0 }
};

const cardVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 400, damping: 30 }
  },
  exit: { scale: 0.9, opacity: 0 }
};

const NordeaBankingAdmin: React.FC = () => {
  useEffect(() => {
    document.title = "Nordea Banking Admin";
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
   

      <div className="container mx-auto px-4 py-6">
        {/* Page title and date */}
        <motion.div 
          className="flex justify-between items-center mb-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.h1 
            className="text-xl font-bold text-gray-800"
            variants={itemVariants}
          >
            Banking System Overview
          </motion.h1>
          <motion.div 
            className="flex items-center bg-white rounded-lg px-3 py-1 shadow-sm text-sm text-gray-600"
            variants={itemVariants}
          >
            <Calendar className="h-4 w-4 mr-2" />
            April 20, 2025
          </motion.div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="bg-white rounded-lg shadow-sm p-4 flex items-center border-l-4 border-blue-500"
            variants={cardVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="mr-3 bg-blue-50 p-2 rounded-md">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Users</div>
              <div className="text-lg font-semibold">24,567</div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-sm p-4 flex items-center border-l-4 border-green-500"
            variants={cardVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="mr-3 bg-green-50 p-2 rounded-md">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Transactions</div>
              <div className="text-lg font-semibold">3,892</div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-sm p-4 flex items-center border-l-4 border-purple-500"
            variants={cardVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="mr-3 bg-purple-50 p-2 rounded-md">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Revenue</div>
              <div className="text-lg font-semibold">€1.45M</div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-sm p-4 flex items-center border-l-4 border-yellow-500"
            variants={cardVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="mr-3 bg-yellow-50 p-2 rounded-md">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Growth</div>
              <div className="text-lg font-semibold">+12.8%</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Main chart - Revenue Trend */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm p-4 lg:col-span-2"
            variants={itemVariants}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700 text-sm">Revenue Trend</h3>
              <div className="flex text-xs space-x-2">
                <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Monthly</span>
                <span className="text-gray-500 px-2 py-1">Quarterly</span>
                <span className="text-gray-500 px-2 py-1">Yearly</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4 }} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#4f46e5"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Alerts and notifications */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm p-4"
            variants={itemVariants}
          >
            <h3 className="font-semibold text-gray-700 text-sm mb-4">System Alerts</h3>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <motion.div 
                  key={alert.id}
                  className="flex items-center p-2 rounded-md bg-gray-50"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: alert.id * 0.1 }}
                >
                  <div className={`
                    p-1.5 rounded-full mr-3
                    ${alert.severity === 'high' ? 'bg-red-100 text-red-600' : 
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' : 
                      'bg-blue-100 text-blue-600'}
                  `}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium">{alert.title}</div>
                    <div className="text-xs text-gray-500">{alert.time}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <h3 className="font-semibold text-gray-700 text-sm mt-6 mb-4">Pending Approvals</h3>
            <div className="space-y-3">
              {pendingApprovals.map((item) => (
                <motion.div 
                  key={item.id}
                  className="flex items-center p-2 rounded-md bg-gray-50"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + item.id * 0.1 }}
                >
                  <div className="p-1.5 rounded-full bg-indigo-100 text-indigo-600 mr-3">
                    <FileClock className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium">{item.user}</div>
                    <div className="text-xs text-gray-500">{item.type} • {item.time}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Grouped: Weekly Transactions & Account Distribution (left), TransactionHistory (right) */}
          <div className="lg:col-span-3 flex flex-col lg:flex-row gap-6">
            <div className="flex flex-col flex-1 gap-6">
              {/* Weekly Transactions */}
              <motion.div 
                className="bg-white rounded-lg shadow-sm p-4"
                variants={itemVariants}
              >
                <h3 className="font-semibold text-gray-700 text-sm mb-4">Weekly Transactions</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={transactionData}
                      margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4 }} />
                      <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Account Distribution */}
              <motion.div 
                className="bg-white rounded-lg shadow-sm p-4"
                variants={itemVariants}
              >
                <h3 className="font-semibold text-gray-700 text-sm mb-4">Account Distribution</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        iconSize={10}
                        iconType="circle"
                        formatter={(value) => <span className="text-xs">{value}</span>}
                      />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4 }} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
            {/* TransactionHistory on the right */}
            <div className="flex-1">
              <TransactionHistory />
            </div>
          </div>

          {/* User Activity by Channel */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm p-4 lg:col-span-2"
            variants={itemVariants}
          >
            <h3 className="font-semibold text-gray-700 text-sm mb-4">User Activity by Channel</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={userActivityData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4 }} />
                  <Legend
                    iconSize={10}
                    formatter={(value) => <span className="text-xs">{value}</span>}
                  />
                  <Bar dataKey="mobile" name="Mobile App" stackId="a" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="web" name="Web Banking" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="branch" name="Branch Visits" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Quick Stats Grid */}
          <motion.div 
            className="bg-white rounded-lg shadow-sm p-4"
            variants={itemVariants}
          >
            <h3 className="font-semibold text-gray-700 text-sm mb-4">Quick Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                className="p-3 bg-blue-50 rounded-lg"
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs font-medium text-blue-800">Active Users</div>
                  <UserCheck className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-lg font-bold text-blue-900">12,892</div>
                <div className="text-xs text-blue-600">+8.2% from last week</div>
              </motion.div>
              
              <motion.div 
                className="p-3 bg-green-50 rounded-lg"
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs font-medium text-green-800">Success Rate</div>
                  <Activity className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-lg font-bold text-green-900">99.7%</div>
                <div className="text-xs text-green-600">+0.2% from yesterday</div>
              </motion.div>
              
              <motion.div 
                className="p-3 bg-yellow-50 rounded-lg"
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs font-medium text-yellow-800">Avg Response</div>
                  <BarChart2 className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="text-lg font-bold text-yellow-900">1.2s</div>
                <div className="text-xs text-yellow-600">-0.1s from last week</div>
              </motion.div>
              
              <motion.div 
                className="p-3 bg-purple-50 rounded-lg"
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs font-medium text-purple-800">Global Usage</div>
                  <Globe className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-lg font-bold text-purple-900">24</div>
                <div className="text-xs text-purple-600">Countries active today</div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NordeaBankingAdmin;