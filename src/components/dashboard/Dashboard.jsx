import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import RequestsDashboard from "./RequestsDashboard";

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-[#121212] text-white">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route index element={<RequestsDashboard />} />
            <Route path="usage" element={<div>Usage Page</div>} />
            <Route path="users" element={<div>Users Page</div>} />
            <Route path="api-keys" element={<div>API Keys Page</div>} />
            <Route path="settings" element={<div>Settings Page</div>} />
            <Route path="billing" element={<div>Billing Page</div>} />
            <Route path="get-started" element={<div>Get Started Page</div>} />
            <Route path="status" element={<div>Status Page</div>} />
            <Route path="playground" element={<div>Playground Page</div>} />
            <Route path="docs" element={<div>Documentation Page</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

