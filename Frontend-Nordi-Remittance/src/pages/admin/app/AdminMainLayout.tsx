import React from 'react'
import AdminLeftContainer from '../container/AdminLeftContainer'
import AdminRightContainer from '../container/AdminRightContainer'
import AdminRoutes from '../AdminRoutes'
import { useRealtimeUpdates } from '@hooks/useSocket'
import { useSessionManager } from '@hooks/useSessionManager'
import { SessionExpiredModal } from '@components/shared/SessionExpiredModal'

const AdminMainLayout = () => {
  // Activate all real-time WebSocket subscriptions for admin role
  useRealtimeUpdates('admin');

  // Session management: inactivity timeout, 401 handling, multi-tab sync
  const { modalState, handleExtendSession, handleRedirect } = useSessionManager('admin');

  return (
    <>
      <div className="flex w-full h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
        {/* Left Container - fixed, full height */}
        <div className="h-screen">
          <AdminLeftContainer />
        </div>
        {/* Right Container - flex-1, scrollable */}
        <div className="flex-1 h-screen overflow-y-auto bg-white dark:bg-gray-950">
          <AdminRightContainer>
            <AdminRoutes />
          </AdminRightContainer>
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

export default AdminMainLayout
