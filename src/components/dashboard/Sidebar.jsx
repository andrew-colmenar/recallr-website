// components/Sidebar.jsx
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
import "../../styles/Sidebar.css";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="text-black text-xs"></span>
        </div>
        <span className="sidebar-title">Recallr AI</span>
      </div>

      <div className="sidebar-nav">
        <nav>
          <ul>
            <li>
              <Link
                to="/usage"
                className={`nav-item ${isActive("/usage")}`}
              >
                <div className="icon-container">
                  <Activity className="w-4 h-4" />
                </div>
                <span>Usage</span>
              </Link>
            </li>
            <li>
              <Link
                to="/users"
                className={`nav-item ${isActive("/users")}`}
              >
                <div className="icon-container">
                  <User className="w-4 h-4" />
                </div>
                <span>Users</span>
              </Link>
            </li>
            <li>
              <Link
                to="/apikeys"
                className={`nav-item ${isActive("/apikeys")}`}
              >
                <div className="icon-container">
                  <Key className="w-4 h-4" />
                </div>
                <span>Api Keys</span>
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className={`nav-item ${isActive("/settings")}`}
              >
                <div className="icon-container">
                  <Settings className="w-4 h-4" />
                </div>
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="sidebar-footer">
        <nav>
          <ul>
            <li>
              <Link
                to="/billing"
                className={`nav-item ${isActive("/pricing")}`}
              >
                <div className="icon-container">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span>Billing</span>
              </Link>
            </li>
            <li>
              <Link
                to="/getstarted"
                className={`nav-item ${isActive("/getstarted")}`}
              >
                <div className="icon-container">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <span>Get Started</span>
              </Link>
            </li>
            <li>
              <Link
                to="/status"
                className={`nav-item ${isActive("/status")}`}
              >
                <div className="icon-container">
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