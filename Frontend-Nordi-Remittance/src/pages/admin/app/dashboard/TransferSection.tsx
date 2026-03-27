import React, { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { dashboardItemVariants } from "@core/animation/Animation";
import { ChartSkeleton } from "@components/skeletons/Skeletons";
import TransferSidebar from "./TransferSidebar";

const LazyTransferHistory = lazy(() => import("./TransferHistory"));

interface TransferSectionProps {
  transferStats: {
    todayVolume: number;
    todayCount: number;
    avgTransferSize: number;
    successRate: number;
    pendingCount: number;
    failedCount: number;
  };
}

const TransferSection: React.FC<TransferSectionProps> = ({ transferStats }) => {
  return (
    <motion.div variants={dashboardItemVariants} className="flex flex-col lg:flex-row gap-4">
      {/* Transfer History Table — ~80% */}
      <div className="flex-1 min-w-0">
        <Suspense fallback={<ChartSkeleton />}>
          <LazyTransferHistory />
        </Suspense>
      </div>

      {/* Transfer Sidebar — ~20% */}
      <div className="w-full lg:w-64 xl:w-72 shrink-0">
        <TransferSidebar stats={transferStats} />
      </div>
    </motion.div>
  );
};

export default TransferSection;
