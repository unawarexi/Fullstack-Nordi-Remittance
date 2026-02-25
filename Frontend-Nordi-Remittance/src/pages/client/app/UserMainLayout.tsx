import React from 'react'
import UserLeftContainer from '../container/UserLeftContainer'
import UserRightContainer from '../container/UserRightContainer'
import UserRoutes from '../UserRoutes'
import { useRealtimeUpdates } from '@hooks/useSocket'

const UserMainLayout = () => {
  // Activate all real-time WebSocket subscriptions for user role
  useRealtimeUpdates('user');

  return (
    <div className="flex w-full h-screen">
      {/* Left Container - fixed, full height */}
      <div className="h-screen">
        <UserLeftContainer />
      </div>
      {/* Right Container - flex-1, scrollable */}
      <div className="flex-1 h-screen overflow-y-auto bg-white">
        <UserRightContainer>
          <UserRoutes />
        </UserRightContainer>
      </div>
    </div>
  )
}

export default UserMainLayout
