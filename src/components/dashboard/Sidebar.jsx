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

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "bg-[#1e1e1e]" : "";
  };

  return (
    <aside className="w-64 bg-[#121212] border-r border-[#2a2a2a] flex flex-col">
      <div className="p-4 flex items-center gap-2 border-b border-[#2a2a2a]">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <span className="text-black text-xs"></span>
          </div>
          <span className="ml-2 font-semibold text-lg">Recallr AI</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="p-2">
          <ul className="space-y-1">
            <li>
              <Link
                to="/usage"
                className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#1e1e1e] ${isActive("/usage")}`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <span>Usage</span>
              </Link>
            </li>
            <li>
              <Link
                to="/users"
                className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#1e1e1e] ${isActive("/users")}`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span>Users</span>
              </Link>
            </li>
            <li>
              <Link
                to="/apikeys"
                className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#1e1e1e] ${isActive("/apikeys")}`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <span>Api Keys</span>
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#1e1e1e] ${isActive("/settings")}`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="mt-auto border-t border-[#2a2a2a]">
        <nav className="p-2">
          <ul className="space-y-1">
            <li>
                <Link
                    to="/pricing"
                    className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#1e1e1e] ${isActive("/pricing")}`}
                >
                    <div className="w-5 h-5 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                    </div>
                    <span>Billing</span>
                </Link>
            </li>
            <li>
              <Link
                to="/getstarted"
                className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#1e1e1e] ${isActive("/getstarted")}`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <span>Get Started</span>
              </Link>
            </li>
            <li>
              <Link
                to="/status"
                className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#1e1e1e] ${isActive("/status")}`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
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
