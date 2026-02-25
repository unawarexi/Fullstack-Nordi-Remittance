
AccountSubPages.tsx:103 Uncaught TypeError: allWallets.filter is not a function
    at CurrentAccount (AccountSubPages.tsx:103:30)
chunk-3QO5DIOC.js?v=338525e6:14052 The above error occurred in the <CurrentAccount> component:

    at CurrentAccount (http://localhost:5173/src/pages/client/components/accounts/AccountSubPages.tsx?t=1772035089689:207:20)
    at RenderedRoute (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=338525e6:3653:5)
    at Routes (http://localhost:5173/node_modules/.vite/deps/react-router-dom.js?v=338525e6:4088:5)
    at UserRoutes
    at div
    at div
    at UserRightContainer (http://localhost:5173/src/pages/client/container/UserRightContainer.tsx?t=1772022390308:19:31)
    at div
    at div
    at UserMainLayout (http://localhost:5173/src/pages/client/app/UserMainLayout.tsx?t=1772034512983:26:3)
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
ErrorBoundary.tsx:42 Error caught by ErrorBoundary: TypeError: allWallets.filter is not a function
    at CurrentAccount (AccountSubPages.tsx:103:30)
 
Object
