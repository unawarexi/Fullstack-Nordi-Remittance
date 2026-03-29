import React from 'react';

import { Ban } from 'lucide-react';

export default function NotAvailableYet() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-neutral-500">
      <Ban size={64} className="mb-4 text-amber-500" />
      <div className="text-xl font-semibold mb-2">Not Available Yet</div>
      <div>This screen is not implemented yet.</div>
    </div>
  );
}

// export function RenderContent({ pathname }: { pathname: string }) {
//   switch (pathname) {
//     case '/overview':
//       return <AdminOverview />;
//     case '/wallet':
//       return (
       
//             <Route />
      
//       );
//     default:
//       return <NotAvailableYet />;
//   }
// }