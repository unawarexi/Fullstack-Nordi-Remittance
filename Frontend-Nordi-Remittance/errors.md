Uncaught TypeError: Cannot read properties of undefined (reading 'search')
at OverviewUsers (OverviewUsers.tsx:167:30)
OverviewUsers.tsx:167 Uncaught TypeError: Cannot read properties of undefined (reading 'search')
at OverviewUsers (OverviewUsers.tsx:167:30)

chunk-3QO5DIOC.js?v=5ea03c80:14052 The above error occurred in the <OverviewUsers> component:

    at OverviewUsers (http://localhost:5173/src/pages/admin/app/users/OverviewUsers.tsx?t=1787416613219:65:20)
    at AdminRightContainer (http://localhost:5173/src/pages/admin/container/AdminRightContainer.tsx?t=1787416613219:19:32)
    at div
    at div
    at AdminMainLayout (http://localhost:5173/src/pages/admin/app/AdminMainLayout.tsx?t=1787417403801:26:3)

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
logCapturedError @ chunk-3QO5DIOC.js?v=5ea03c80:14052
ErrorBoundary.tsx:42 Error caught by ErrorBoundary: TypeError: Cannot read properties of undefined (reading 'search')
at OverviewUsers (OverviewUsers.tsx:167:30)
