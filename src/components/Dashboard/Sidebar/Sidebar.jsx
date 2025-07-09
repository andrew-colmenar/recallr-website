import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  MessageSquare,
  User,
  Key,
  FileOutputIcon as FileExport,
  Settings,
  AlertCircle,
  LifeBuoy,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import styles from "./Sidebar.module.css";

const Sidebar = ({ projectId }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path) => {
    return location.pathname.includes(path) ? styles.active : "";
  };

  // More precise active check for exact path matches
  const isExactActive = (path) => {
    const currentPath = location.pathname + location.search;
    const targetPath = path + location.search;
    return currentPath === targetPath ? styles.active : "";
  };

  // Helper function to create project-specific URLs for dashboard routes
  const projectUrl = (path) => {
    return `/dashboard/${path}?project=${projectId}`;
  };

  // Get the current section name for display in header
  const getCurrentSectionName = () => {
    const path = location.pathname;
    if (path.includes("/usage")) return "Usage";
    if (path.includes("/users")) return "Users";
    if (path.includes("/apikeys")) return "API Keys";
    if (path.includes("/settings")) return "Settings";
    if (path.includes("/getstarted")) return "Get Started";
    if (path.includes("/status")) return "Status";
    return "Dashboard";
  };

  return (
    <>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
        <div className={styles.sidebarHeader}>
          <button
            className={styles.collapseButton}
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        <div className={styles.sidebarNav}>
          <nav>
            <ul>
              <li>
                <Link
                  to="/dashboard/main"
                  className={`${styles.navItem} ${isActive("/dashboard/main")}`}
                >
                  <div className={styles.iconContainer}>
                    <Activity size={18} />
                  </div>
                  <span>Main Dashboard</span>
                </Link>
              </li>
              {/* <li>
                <Link
                  to={projectUrl("usage")}
                  className={`${styles.navItem} ${isActive("/usage")}`}
                >
                  <div className={styles.iconContainer}>
                    <Activity size={18} />
                  </div>
                  <span>Usage</span>
                </Link>
              </li> */}
              <li>
                <Link
                  to={projectUrl("users")}
                  className={`${styles.navItem} ${isActive("/users")}`}
                >
                  <div className={styles.iconContainer}>
                    <User size={18} />
                  </div>
                  <span>Users</span>
                </Link>
              </li>
              <li>
                <Link
                  to={projectUrl("apikeys")}
                  className={`${styles.navItem} ${isActive("/apikeys")}`}
                >
                  <div className={styles.iconContainer}>
                    <Key size={18} />
                  </div>
                  <span>API Keys</span>
                </Link>
              </li>
              <li>
                <Link
                  to={projectUrl("settings")}
                  className={`${styles.navItem} ${isActive("/settings")}`}
                >
                  <div className={styles.iconContainer}>
                    <Settings size={18} />
                  </div>
                  <span>Settings</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className={styles.sidebarFooter}>
          <nav>
            <ul>
              <li>
                <Link
                  to="/getstarted"
                  className={`${styles.navItem} ${isActive("/getstarted")}`}
                >
                  <div className={styles.iconContainer}>
                    <AlertCircle size={18} />
                  </div>
                  <span>Get Started</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://status.recallrai.com"
                  className={styles.navItem}
                  rel="noopener noreferrer"
                >
                  <div className={styles.iconContainer}>
                    <LifeBuoy size={18} />
                  </div>
                  <span>Status</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
      {/* Show a small open button when sidebar is collapsed and off-screen */}
      {collapsed && (
        <button
          className={styles.openSidebarButton}
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </>
  );
};

export default Sidebar;
