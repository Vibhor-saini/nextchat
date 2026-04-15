import React from "react";
import Sidebar from "@/components/chat/Sidebar";

const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default AuthenticatedLayout;