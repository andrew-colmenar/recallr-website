import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import RequestsDashboard from "./RequestsDashboard";
import ComingSoon from "../CommingSoon";

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-[#121212] text-white">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route index element={<RequestsDashboard />} />
            <Route path="usage" element={<ComingSoon />} />
            <Route path="users" element={<ComingSoon />} />
            <Route path="apikeys" element={<ComingSoon />} />
            <Route path="settings" element={<ComingSoon />} />
            <Route path="billing" element={<ComingSoon />} />
            <Route path="getstarted" element={<ComingSoon />} />
            <Route path="status" element={<ComingSoon />} />
            <Route path="playground" element={<ComingSoon />} />
            <Route path="docs" element={<ComingSoon />} />
            <Route path="*" element={<ComingSoon />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;