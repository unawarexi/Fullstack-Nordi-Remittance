  {/* Account balance summary */}
  {!collapsed && (
    <motion.div 
      className="px-4 mb-6"
      variants={itemVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-3 text-white shadow-md">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium opacity-90">Total Balance</span>
          <DollarSign size={14} />
        </div>
        <div className="text-lg font-bold">$24,850.75</div>
        <div className="flex justify-between items-center mt-2 text-xs">
          <span>
            <span className="opacity-80">Income</span>
            <span className="ml-1 bg-green-400 bg-opacity-30 text-white px-2 py-0.5 rounded-full">+$2,450</span>
          </span>
          <span>
            <span className="opacity-80">Spent</span>
            <span className="ml-1 bg-red-400 bg-opacity-30 text-white px-2 py-0.5 rounded-full">-$1,280</span>
          </span>
        </div>
      </div>
    </motion.div>
  )}