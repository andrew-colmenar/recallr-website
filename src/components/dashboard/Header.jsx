// components/Header.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Plus } from "lucide-react";

const Header = () => {
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="h-14 border-b border-[#2a2a2a] flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            className="flex items-center gap-2 text-sm hover:bg-[#1e1e1e] px-2 py-1 rounded"
            onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
          >
            <span className="text-gray-400">game-default-org</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {isProjectMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-[#1e1e1e] border border-[#2a2a2a] rounded-md shadow-lg z-10">
              <div className="p-2">
                <div className="p-2 hover:bg-[#2a2a2a] rounded cursor-pointer">
                  <div className="text-sm">game-default-org</div>
                  <div className="text-xs text-gray-400">default-project</div>
                </div>
                <div className="mt-2 p-2 hover:bg-[#2a2a2a] rounded cursor-pointer border-t border-[#2a2a2a]">
                  <div className="text-sm flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create new project
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/" className={`px-3 py-1 text-sm ${location.pathname === "/" ? "text-white" : "text-gray-400"}`}>
          Dashboard
        </Link>
        <Link
          to="/playground"
          className={`px-3 py-1 text-sm ${location.pathname === "/playground" ? "text-white" : "text-gray-400"}`}
        >
          Playground
        </Link>
        <Link
          to="/docs"
          className={`px-3 py-1 text-sm ${location.pathname === "/docs" ? "text-white" : "text-gray-400"}`}
        >
          Docs
        </Link>
        <div className="flex items-center gap-2 ml-4">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
            <span className="text-sm font-medium">G</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
