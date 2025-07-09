import React, { useState } from "react";
import Sidebar from "./Sidebar/Sidebar";
import styles from "./Dashboard.module.css";
import { useNavigate } from "react-router-dom";
import { useProjectContext } from "../../context/ProjectContext";
import ProjectModal from "./Projects/ProjectModal";

const MainDashboard = () => {
  const { currentProjectId } = useProjectContext();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const navigate = useNavigate();

  if (!currentProjectId) {
    return (
      <div className={styles.mainContainer}>
        <Sidebar projectId="" />
        <div className={styles.contentContainer}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", gap: "2.5rem" }}>
            {/* Create New Project */}
            <div
              style={{
                background: "#1F2937",
                borderRadius: 16,
                boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                padding: "2.5rem 2.2rem",
                minWidth: 260,
                textAlign: "center",
                cursor: "pointer",
                border: "2px solid #3B82F6",
                transition: "transform 0.15s",
              }}
              onClick={() => navigate("/dashboard/projects")}
            >
              <h2 style={{ fontSize: "1.3rem", marginBottom: 12 }}>Create New Project</h2>
              <p style={{ color: "#9CA3AF", fontSize: 15 }}>Start fresh with a new project.</p>
            </div>
            {/* Select Existing Project */}
            <div
              style={{
                background: "#1F2937",
                borderRadius: 16,
                boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                padding: "2.5rem 2.2rem",
                minWidth: 260,
                textAlign: "center",
                cursor: "pointer",
                border: "2px solid #A855F7",
                transition: "transform 0.15s",
              }}
              onClick={() => setIsProjectModalOpen(true)}
            >
              <h2 style={{ fontSize: "1.3rem", marginBottom: 12 }}>Select Existing Project</h2>
              <p style={{ color: "#9CA3AF", fontSize: 15 }}>Choose from your existing projects.</p>
            </div>
            {/* Navigate to Get Started */}
            <div
              style={{
                background: "#1F2937",
                borderRadius: 16,
                boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                padding: "2.5rem 2.2rem",
                minWidth: 260,
                textAlign: "center",
                cursor: "pointer",
                border: "2px solid #F59E42",
                transition: "transform 0.15s",
              }}
              onClick={() => navigate("/getstarted")}
            >
              <h2 style={{ fontSize: "1.3rem", marginBottom: 12 }}>Get Started with SDK</h2>
              <p style={{ color: "#9CA3AF", fontSize: 15 }}>View the SDK quick start guide.</p>
            </div>
          </div>
          <ProjectModal
            isOpen={isProjectModalOpen}
            onClose={() => setIsProjectModalOpen(false)}
            onProjectSelect={() => setIsProjectModalOpen(false)}
            currentProjectId={null}
          />
        </div>
      </div>
    );
  }

  // Normal dashboard content if a project is selected
  return (
    <div className={styles.mainContainer}>
      <Sidebar projectId={currentProjectId} />
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