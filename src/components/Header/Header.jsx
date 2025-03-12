import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Plus } from "lucide-react";
import styles from './Header.module.css';

const Header = () => {
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.projectDropdown}>
          <button
            className={styles.projectDropdownButton}
            onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
          >
            <span className={styles.orgName}>game-default-org</span>
            <ChevronDown className={styles.dropdownIcon} />
          </button>

          {isProjectMenuOpen && (
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownContent}>
                <div className={styles.dropdownItem}>
                  <div className={styles.dropdownItemTitle}>game-default-org</div>
                  <div className={styles.dropdownItemSubtitle}>default-project</div>
                </div>
                <div className={styles.dropdownItemCreate}>
                  <div className={styles.createProject}>
                    <Plus className={styles.createIcon} />
                    Create new project
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.headerRight}>
        <Link to="/" className={`${styles.navLink} ${location.pathname === "/" ? styles.active : ""}`}>
          Dashboard
        </Link>
        <Link
          to="/playground"
          className={`${styles.navLink} ${location.pathname === "/playground" ? styles.active : ""}`}
        >
          Playground
        </Link>
        <Link
          to="/docs"
          className={`${styles.navLink} ${location.pathname === "/docs" ? styles.active : ""}`}
        >
          Docs
        </Link>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            <span className={styles.avatarText}>G</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;