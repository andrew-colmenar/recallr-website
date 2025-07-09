import React from "react";
import Sidebar from "./Sidebar/Sidebar";
import styles from "./Dashboard.module.css";

const MainDashboard = () => {
  return (
    <div className={styles.mainContainer}>
      <Sidebar projectId="" />
      <div className={styles.contentContainer}>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h1>Main Dashboard</h1>
          <p>This is the main dashboard page. Content coming soon.</p>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard; 