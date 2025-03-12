import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar"
import Header from "../Header/Header";
import RequestsDashboard from "./RequestsDashboard";
import ComingSoon from "../ComingSoon/ComingSoon";
import Billing from "../Billing/Billing";
import styles from "./Dashboard.module.css";
import APIKeys from "./APIKeys/APIKeys";

const Dashboard = () => {
  return (
    <div className={styles.mainContainer}>
      <Sidebar />
      <div className={styles.contentContainer}>
        <Header />
        <main className={styles.main}>
          <Routes>
            <Route index element={<RequestsDashboard />} />
            <Route path="usage" element={<ComingSoon />} />
            <Route path="users" element={<ComingSoon />} />
            <Route path="apikeys" element={<APIKeys />} />
            <Route path="settings" element={<ComingSoon />} />
            <Route path="billing" element={<Billing />} />
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