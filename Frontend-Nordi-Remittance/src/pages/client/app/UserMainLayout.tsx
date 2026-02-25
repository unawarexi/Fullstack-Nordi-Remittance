import React from 'react'
import UserLeftContainer from '../container/UserLeftContainer'
import UserRightContainer from '../container/UserRightContainer'
import UserRoutes from '../UserRoutes'
import { useRealtimeUpdates } from '@hooks/useSocket'
import { useSessionManager } from '@hooks/useSessionManager'
import { SessionExpiredModal } from '@components/shared/SessionExpiredModal'

const UserMainLayout = () => {
  // Activate all real-time WebSocket subscriptions for user role
  useRealtimeUpdates('user');

  // Session management: inactivity timeout, 401 handling, multi-tab sync
  const { modalState, handleExtendSession, handleRedirect } = useSessionManager('user');

  return (
    <>
      <div className="flex w-full h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
        {/* Left Container - fixed, full height */}
        <div className="h-screen">
          <UserLeftContainer />
        </div>
        {/* Right Container - flex-1, scrollable */}
        <div className="flex-1 h-screen overflow-y-auto bg-white dark:bg-gray-950 transition-colors duration-200">
          <UserRightContainer>
            <UserRoutes />
          </UserRightContainer>
        </div>
      </div>

      {/* Session expired / inactivity warning modal */}
      <SessionExpiredModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        reason={modalState.reason}
        countdown={modalState.countdown}
        onExtend={handleExtendSession}
        onRedirect={handleRedirect}
      />
    </>
  )
}

export default UserMainLayout
