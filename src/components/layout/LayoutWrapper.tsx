'use client';

import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 flex flex-col">
        <Header onMenuClick={toggleSidebar} />
        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
