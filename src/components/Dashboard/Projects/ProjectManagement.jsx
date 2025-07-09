import React from "react";
import Sidebar from "../Sidebar/Sidebar";
import styles from "../Dashboard.module.css";

const ProjectManagement = () => {
  return (
    <div className={styles.mainContainer}>
      <Sidebar projectId="" />
      <div className={styles.contentContainer}>
        <div style={{ padding: "2.5rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "2.2rem", marginBottom: "1.5rem" }}>Project Management</h1>
          <p>Project management features will be available here soon.</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectManagement; 