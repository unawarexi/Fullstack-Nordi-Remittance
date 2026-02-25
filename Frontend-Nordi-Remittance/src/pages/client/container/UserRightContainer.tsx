import React, { ReactNode } from "react";
import RightContainerNav from "../presentation/RightContainerNav";
import RightContainerFooter from "../presentation/RightContainerFooter";

interface AdminRightContainerProps {
  children?: ReactNode;
}

const UserRightContainer = ({ children }: AdminRightContainerProps) => {
  return (
    <div className="flex h-screen flex-col bg-white dark:bg-gray-950 transition-colors duration-200">
      <div className="bg-white dark:bg-gray-900 sticky top-0 z-20 shadow dark:shadow-gray-800/50">
        <RightContainerNav />
      </div>
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">{children}</div>

      <div className="dark:bg-gray-900">
        <RightContainerFooter />
      </div>
    </div>
  );
};

export default UserRightContainer;
