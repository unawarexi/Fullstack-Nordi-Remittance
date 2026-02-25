statistics.api.ts:34 
 GET http://localhost:3000/api/v1/statistics/dashboard 403 (Forbidden)

cards.api.ts:43 
 GET http://localhost:3000/api/v1/cards 403 (Forbidden)
kyc.api.ts:71 
 GET http://localhost:3000/api/v1/kyc/status 404 (Not Found)
notifications.api.ts:56 
 GET http://localhost:3000/api/v1/notifications/unread/count 403 (Forbidden)
notifications.api.ts:66 
 GET http://localhost:3000/api/v1/notifications/unread?limit=5 403 (Forbidden)
investments.api.ts:323 
 GET http://localhost:3000/api/v1/investments/savings-goals 403 (Forbidden)


chunk-3QO5DIOC.js?v=338525e6:14052 The above error occurred in the <AccountSummaryPanel> component:

    at AccountSummaryPanel (http://localhost:5173/src/pages/client/components/overview/AccountSummary.tsx?t=1772018325721:74:20)
    at div
    at div
    at MotionComponent (http://localhost:5173/node_modules/.vite/deps/framer-motion.js?v=338525e6:6453:40)
    at UserDashboardOverview (http://localhost:5173/src/pages/client/components/UserOverview.tsx?t=1772018325721:33:20)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=338525e6:3653:5)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=338525e6:4088:5)
    at UserRoutes
    at div
    at div
    at UserRightContainer (http://localhost:5173/src/pages/client/container/UserRightContainer.tsx:19:31)
    at div
    at div
    at UserMainLayout (http://localhost:5173/src/pages/client/app/UserMainLayout.tsx?t=1772018325721:26:3)
    at ProtectedRoute (http://localhost:5173/src/components/shared/ProtectedRoute.tsx?t=1772018325721:22:3)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=338525e6:3653:5)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=338525e6:4088:5)
    at Suspense
    at Router (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=338525e6:4031:15)
    at BrowserRouter (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=338525e6:4774:5)
    at ThemeProvider (http://localhost:5173/src/contexts/ThemeProvider.tsx:20:26)
    at ErrorBoundary (http://localhost:5173/src/components/shared/ErrorBoundary.tsx:24:5)
    at App
    at NavbarProvider (http://localhost:5173/src/contexts/navbar-context.tsx:20:34)
    at http://localhost:5173/src/contexts/index.tsx:22:13
    at ContextStore (http://localhost:5173/src/contexts/index.tsx:42:32)
    at QueryClientProvider (http://localhost:5173/node_modules/.vite/deps/chunk-2C4WLWTL.js?v=338525e6:3192:3)

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
ErrorBoundary.tsx:42 Error caught by ErrorBoundary: TypeError: wallets.reduce is not a function
    at AccountSummaryPanel (AccountSummary.tsx:54:13)
 
{componentStack: '\n    at AccountSummaryPanel (http://localhost:5173…s/.vite/deps/chunk-2C4WLWTL.js?v=338525e6:3192:3)'}
session.manager.ts:152 [SessionManager] Stopped
transactions.api.ts:72 
 GET http://localhost:3000/api/v1/transactions/recent?limit=5 403 (Forbidden)
statistics.api.ts:123 
 GET http://localhost:3000/api/v1/statistics/spending/categories?period=1M 403 (Forbidden)
﻿
