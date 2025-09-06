import React, { useState } from 'react';
import Header from './Header';

const HomeLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <main>
        {children}
      </main>
    </div>
  );
};

export default HomeLayout;
