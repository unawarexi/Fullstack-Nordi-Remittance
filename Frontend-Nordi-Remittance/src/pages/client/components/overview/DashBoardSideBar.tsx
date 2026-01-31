import React from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  Bell, 
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Newspaper,
  DollarSign,
  MapPin,
  ChevronRight,
  Upload,
  Shield,
  MessageSquare
} from "lucide-react";

// Sample data for upcoming reminders
const remindersData = [
  {
    id: "rem1",
    title: "Loan Payment Due",
    date: "April 23, 2025",
    time: "Automatic payment",
    amount: "$450.00",
    icon: <Clock size={16} />,
    color: "text-indigo-600 bg-indigo-100"
  },
  {
    id: "rem2",
    title: "Credit Card Bill",
    date: "April 28, 2025",
    time: "Automatic payment",
    amount: "$1,240.50",
    icon: <CreditCard size={16} />,
    color: "text-purple-600 bg-purple-100"
  },
  {
    id: "rem3",
    title: "Savings Goal Contribution",
    date: "April 30, 2025",
    time: "Scheduled transfer",
    amount: "$200.00",
    icon: <Calendar size={16} />,
    color: "text-pink-600 bg-pink-100"
  }
];

// Sample data for AI insights
const insightsData = [
  {
    id: "ins1",
    title: "You spent 15% less on dining this month!",
    description: "Great job cutting back on restaurant expenses.",
    icon: <TrendingDown size={16} />,
    color: "text-emerald-600 bg-emerald-100"
  },
  {
    id: "ins2",
    title: "Consider boosting your emergency fund",
    description: "Adding just $50 more per month would reach your goal 3 months sooner.",
    icon: <Lightbulb size={16} />,
    color: "text-amber-600 bg-amber-100"
  },
  {
    id: "ins3",
    title: "Investment opportunity",
    description: "New 12-month CD with 4.5% APY available now.",
    icon: <TrendingUp size={16} />,
    color: "text-blue-600 bg-blue-100"
  }
];

// Sample data for cards
const cardsData = [
  {
    id: "card1",
    name: "Platinum Rewards",
    lastFour: "6789",
    expiryDate: "05/28",
    isActive: true,
    isVirtual: false,
    spendLimit: "$5,000",
    usedAmount: "$1,850",
    color: "bg-gradient-to-r from-indigo-600 to-purple-600"
  },
  {
    id: "card2",
    name: "Virtual Debit",
    lastFour: "4321",
    expiryDate: "12/26",
    isActive: true,
    isVirtual: true,
    spendLimit: "$2,000",
    usedAmount: "$450",
    color: "bg-gradient-to-r from-purple-500 to-pink-500"
  }
];

// Sample news data
const newsData = [
  {
    id: "news1",
    title: "Fed announces interest rate decision",
    time: "2 hours ago"
  },
  {
    id: "news2",
    title: "Stock market hits new record high",
    time: "4 hours ago"
  }
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};

const DashboardSidebar: React.FC = () => {
  return (
    <div className="w-full lg:w-80 flex flex-col gap-6">
      {/* Upcoming Reminders & Scheduled Payments */}
      <motion.div 
        className="bg-white rounded-xl shadow-sm p-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-indigo-900">Upcoming</h2>
          <Calendar size={18} className="text-purple-500" />
        </div>
        
        <div className="space-y-3">
          {remindersData.map((reminder) => (
            <motion.div
              key={reminder.id}
              className="bg-indigo-50 rounded-lg p-3 hover:bg-indigo-100 transition cursor-pointer"
              variants={itemVariants}
              whileHover={{ x: 3 }}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${reminder.color} mt-1`}>
                  {reminder.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-indigo-900">{reminder.title}</h3>
                    <span className="font-semibold text-purple-700">{reminder.amount}</span>
                  </div>
                  <p className="text-xs text-indigo-600">{reminder.date}</p>
                  <p className="text-xs text-gray-500">{reminder.time}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.button
          className="w-full mt-3 text-center text-sm text-purple-600 hover:text-purple-800 flex items-center justify-center"
          whileHover={{ x: 3 }}
        >
          View All Scheduled Payments <ChevronRight size={16} />
        </motion.button>
      </motion.div>

      {/* AI Insights */}
      <motion.div 
        className="bg-white rounded-xl shadow-sm p-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-indigo-900">Smart Insights</h2>
          <Lightbulb size={18} className="text-purple-500" />
        </div>
        
        <div className="space-y-3">
          {insightsData.map((insight) => (
            <motion.div
              key={insight.id}
              className="border border-indigo-100 rounded-lg p-3 hover:shadow-sm transition cursor-pointer"
              variants={itemVariants}
              whileHover={{ x: 3 }}
            >
              <div className="flex gap-3">
                <div className={`p-2 rounded-lg ${insight.color} h-min`}>
                  {insight.icon}
                </div>
                <div>
                  <h3 className="font-medium text-indigo-900 text-sm">{insight.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{insight.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Cards Preview */}
      <motion.div 
        className="bg-white rounded-xl shadow-sm p-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-indigo-900">Your Cards</h2>
          <CreditCard size={18} className="text-purple-500" />
        </div>
        
        <div className="space-y-4">
          {cardsData.map((card) => (
            <motion.div
              key={card.id}
              className="rounded-xl overflow-hidden"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div 
                className={`${card.color} p-4 text-white relative h-40`}
              >
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs opacity-80">
                      {card.isVirtual ? "Virtual Card" : "Physical Card"}
                    </p>
                    <h3 className="font-semibold">{card.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 bg-red-500 rounded-full opacity-80"></div>
                    <div className="w-5 h-5 bg-amber-400 rounded-full opacity-80 -ml-2"></div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-lg font-mono tracking-wider">•••• •••• •••• {card.lastFour}</p>
                  <div className="flex justify-between mt-2 text-xs opacity-80">
                    <p>Valid Thru: {card.expiryDate}</p>
                    <p>{card.isActive ? "Active" : "Inactive"}</p>
                  </div>
                </div>
                
                <div className="absolute bottom-4 right-4">
                  <p className="text-xs opacity-80">Spend Limit</p>
                  <p className="font-semibold">{card.spendLimit}</p>
                </div>
              </div>
              
              <div className="bg-indigo-50 p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-700">Current Usage</span>
                  <span className="font-medium text-indigo-900">{card.usedAmount}</span>
                </div>
                <div className="w-full bg-white rounded-full h-1.5 mt-2">
                  <motion.div 
                    className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${parseInt(card.usedAmount.replace(/[^0-9]/g, '')) / parseInt(card.spendLimit.replace(/[^0-9]/g, '')) * 100}%` 
                    }}
                    transition={{ duration: 0.8 }}
                  ></motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-3 flex justify-between">
          <motion.button
           className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
           whileHover={{ x: 3 }}
         >
           Manage Cards <ChevronRight size={16} />
         </motion.button>
         
         <motion.button
           className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
           whileHover={{ x: 3 }}
         >
           Add New Card <ChevronRight size={16} />
         </motion.button>
       </div>
     </motion.div>

     {/* Document Status & Identity Verification */}
     <motion.div 
       className="bg-white rounded-xl shadow-sm p-4"
       variants={containerVariants}
       initial="hidden"
       animate="visible"
     >
       <div className="flex justify-between items-center mb-4">
         <h2 className="text-lg font-semibold text-indigo-900">Verification Status</h2>
         <Shield size={18} className="text-purple-500" />
       </div>
       
       <div className="space-y-3">
         <motion.div 
           className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
           variants={itemVariants}
         >
           <div className="flex items-center gap-2">
             <CheckCircle size={18} className="text-green-600" />
             <span className="text-sm font-medium text-green-800">KYC Verified</span>
           </div>
           <span className="text-xs text-green-600">Complete</span>
         </motion.div>
         
         <motion.div 
           className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
           variants={itemVariants}
         >
           <div className="flex items-center gap-2">
             <AlertTriangle size={18} className="text-amber-600" />
             <span className="text-sm font-medium text-amber-800">Address Proof</span>
           </div>
           <span className="text-xs text-amber-600">Update Required</span>
         </motion.div>
         
         <motion.div 
           className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg"
           variants={itemVariants}
         >
           <div className="flex items-center gap-2">
             <Upload size={18} className="text-indigo-600" />
             <span className="text-sm font-medium text-indigo-800">Upload Documents</span>
           </div>
           <ChevronRight size={16} className="text-indigo-600" />
         </motion.div>
       </div>
     </motion.div>

     {/* Notifications & News Feed */}
     <motion.div 
       className="bg-white rounded-xl shadow-sm p-4"
       variants={containerVariants}
       initial="hidden"
       animate="visible"
     >
       <div className="flex justify-between items-center mb-4">
         <h2 className="text-lg font-semibold text-indigo-900">Updates & News</h2>
         <Bell size={18} className="text-purple-500" />
       </div>
       
       {/* Notifications */}
       <div className="border-b border-indigo-100 pb-3 mb-3">
         <div className="flex justify-between items-center mb-2">
           <h3 className="text-sm font-medium text-indigo-900">Notifications</h3>
           <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">3 new</span>
         </div>
         
         <motion.div 
           className="flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-50 cursor-pointer"
           variants={itemVariants}
           whileHover={{ x: 3 }}
         >
           <div className="p-1.5 rounded-full bg-purple-100">
             <MessageSquare size={14} className="text-purple-600" />
           </div>
           <div>
             <p className="text-xs font-medium text-indigo-900">New message from support</p>
             <p className="text-xs text-gray-500">10 minutes ago</p>
           </div>
         </motion.div>
         
         <motion.div 
           className="flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-50 cursor-pointer"
           variants={itemVariants}
           whileHover={{ x: 3 }}
         >
           <div className="p-1.5 rounded-full bg-amber-100">
             <AlertTriangle size={14} className="text-amber-600" />
           </div>
           <div>
             <p className="text-xs font-medium text-indigo-900">Unusual login detected</p>
             <p className="text-xs text-gray-500">1 hour ago</p>
           </div>
         </motion.div>
       </div>
       
       {/* Financial News */}
       <div>
         <div className="flex justify-between items-center mb-2">
           <h3 className="text-sm font-medium text-indigo-900">Financial News</h3>
           <Newspaper size={14} className="text-indigo-500" />
         </div>
         
         {newsData.map((news, index) => (
           <motion.div
             key={news.id}
             className="p-2 hover:bg-indigo-50 rounded-lg cursor-pointer"
             variants={itemVariants}
             whileHover={{ x: 3 }}
           >
             <p className="text-xs font-medium text-indigo-900">{news.title}</p>
             <p className="text-xs text-gray-500">{news.time}</p>
           </motion.div>
         ))}
         
         <motion.button
           className="w-full mt-2 text-center text-sm text-purple-600 hover:text-purple-800"
           whileHover={{ x: 3 }}
         >
           View All News
         </motion.button>
       </div>
     </motion.div>

     {/* Quick Widgets */}
     <motion.div 
       className="bg-white rounded-xl shadow-sm p-4"
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       transition={{ delay: 0.6 }}
     >
       <h2 className="text-lg font-semibold text-indigo-900 mb-3">Tools</h2>
       <div className="grid grid-cols-3 gap-2">
         <motion.div 
           className="p-3 bg-indigo-50 rounded-lg flex flex-col items-center justify-center cursor-pointer"
           whileHover={{ y: -3, backgroundColor: "#e0e7ff" }} // indigo-100
         >
           <DollarSign size={18} className="text-indigo-600 mb-1" />
           <span className="text-xs font-medium text-indigo-800">Forex Rates</span>
         </motion.div>
         
         <motion.div 
           className="p-3 bg-purple-50 rounded-lg flex flex-col items-center justify-center cursor-pointer"
           whileHover={{ y: -3, backgroundColor: "#ede9fe" }} // purple-100
         >
           <MapPin size={18} className="text-purple-600 mb-1" />
           <span className="text-xs font-medium text-purple-800">ATM Finder</span>
         </motion.div>
         
         <motion.div 
           className="p-3 bg-pink-50 rounded-lg flex flex-col items-center justify-center cursor-pointer"
           whileHover={{ y: -3, backgroundColor: "#fce7f3" }} // pink-100
         >
           <Upload size={18} className="text-pink-600 mb-1" />
           <span className="text-xs font-medium text-pink-800">Upload Docs</span>
         </motion.div>
       </div>
     </motion.div>
   </div>
 );
};

export default DashboardSidebar;