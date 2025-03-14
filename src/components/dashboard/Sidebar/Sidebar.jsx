import React from "react";
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
} from "lucide-react";
import styles from "./Sidebar.module.css";

const Sidebar = ({ projectId }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? styles.active : "";
  };

  // Helper function to create project-specific URLs for dashboard routes
  const projectUrl = (path) => {
    return `/dashboard/${path}?project=${projectId}`;
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarNav}>
        <nav>
          <ul>
            <li>
              <Link
                to={projectUrl("usage")}
                className={`${styles.navItem} ${isActive(projectUrl("usage"))}`}
              >
                <div className={styles.iconContainer}>
                  <Activity className="w-4 h-4" />
                </div>
                <span>Usage</span>
              </Link>
            </li>
            <li>
              <Link
                to={projectUrl("users")}
                className={`${styles.navItem} ${isActive(projectUrl("users"))}`}
              >
                <div className={styles.iconContainer}>
                  <User className="w-4 h-4" />
                </div>
                <span>Users</span>
              </Link>
            </li>
            <li>
              <Link
                to={projectUrl("apikeys")}
                className={`${styles.navItem} ${isActive(projectUrl("apikeys"))}`}
              >
                <div className={styles.iconContainer}>
                  <Key className="w-4 h-4" />
                </div>
                <span>API Keys</span>
              </Link>
            </li>
            <li>
              <Link
                to={projectUrl("settings")}
                className={`${styles.navItem} ${isActive(projectUrl("settings"))}`}
              >
                <div className={styles.iconContainer}>
                  <Settings className="w-4 h-4" />
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
                to="/billing"
                className={`${styles.navItem} ${isActive("/billing")}`}
              >
                <div className={styles.iconContainer}>
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span>Billing</span>
              </Link>
            </li>
            <li>
              <Link
                to="/getstarted"
                className={`${styles.navItem} ${isActive("/getstarted")}`}
              >
                <div className={styles.iconContainer}>
                  <AlertCircle className="w-4 h-4" />
                </div>
                <span>Get Started</span>
              </Link>
            </li>
            <li>
              <Link
                to="/status"
                className={`${styles.navItem} ${isActive("/status")}`}
              >
                <div className={styles.iconContainer}>
                  <LifeBuoy className="w-4 h-4" />
                </div>
                <span>Status</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;