import React, { ReactNode } from "react";
import RightContainerNav from "../presentation/RightContainerNav";
import RightContainerFooter from "../presentation/RightContainerFooter";

interface AdminRightContainerProps {
  children?: ReactNode;
}

const AdminRightContainer = ({ children }: AdminRightContainerProps) => {
  return (
    <div className="flex h-screen flex-col">
      <div className="bg-white sticky top-0 z-20 shadow">
        <RightContainerNav />
      </div>
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">{children}</div>

      <div>
        <RightContainerFooter />
      </div>
    </div>
  );
};

export default AdminRightContainer;
