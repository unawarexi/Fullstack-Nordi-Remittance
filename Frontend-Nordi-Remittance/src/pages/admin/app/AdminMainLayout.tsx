import React from 'react'
import AdminLeftContainer from '../container/AdminLeftContainer'
import AdminRightContainer from '../container/AdminRightContainer'
import AdminRoutes from '../AdminRoutes'

const AdminMainLayout = () => {
  return (
    <div className="flex w-full h-screen">
      {/* Left Container - fixed, full height */}
      <div className="h-screen">
        <AdminLeftContainer />
      </div>
      {/* Right Container - flex-1, scrollable */}
      <div className="flex-1 h-screen overflow-y-auto bg-white">
        <AdminRightContainer>
          <AdminRoutes />
        </AdminRightContainer>
      </div>
    </div>
  )
}

export default AdminMainLayout
