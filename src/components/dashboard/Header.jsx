// components/Header.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Plus } from "lucide-react";
import '../../styles/Header.css';

const Header = () => {
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-left">
        <div className="project-dropdown">
          <button
            className="project-dropdown-button"
            onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
          >
            <span className="org-name">game-default-org</span>
            <ChevronDown className="dropdown-icon" />
          </button>

          {isProjectMenuOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-content">
                <div className="dropdown-item">
                  <div className="dropdown-item-title">game-default-org</div>
                  <div className="dropdown-item-subtitle">default-project</div>
                </div>
                <div className="dropdown-item-create">
                  <div className="create-project">
                    <Plus className="create-icon" />
                    Create new project
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="header-right">
        <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
          Dashboard
        </Link>
        <Link
          to="/playground"
          className={`nav-link ${location.pathname === "/playground" ? "active" : ""}`}
        >
          Playground
        </Link>
        <Link
          to="/docs"
          className={`nav-link ${location.pathname === "/docs" ? "active" : ""}`}
        >
          Docs
        </Link>
        <div className="user-profile">
          <div className="avatar">
            <span className="avatar-text">G</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;