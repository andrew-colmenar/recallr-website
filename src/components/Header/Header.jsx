import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Plus, LogOut, Settings } from "lucide-react";
import styles from './Header.module.css';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();
  const profileRef = useRef(null);
  const projectRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect is likely handled in the AuthContext or by a route guard
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      // Close profile dropdown if clicked outside
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      
      // Close project dropdown if clicked outside
      if (projectRef.current && !projectRef.current.contains(event.target)) {
        setIsProjectMenuOpen(false);
      }
    }

    // Add event listener when component mounts
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up the event listener when component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.LogoContainer}>
        <div className={styles.Logo}>
          <span className="text-black text-xs"></span>
        </div>
        <span className={styles.Title}>Recallr AI</span>
      </div>
      <div className={styles.headerLeft}>
        <div className={styles.projectDropdown} ref={projectRef}>
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
                  <Link to="/create-project" className={styles.createProject}>
                    <Plus className={styles.createIcon} />
                    Create new project
                  </Link>
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
        <div className={styles.userProfile} ref={profileRef}>
          <div 
            className={styles.avatar}
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          >
            <span className={styles.avatarText}>{user?.first_name?.[0] || 'G'}</span>
          </div>
          
          {isProfileMenuOpen && (
            <div className={`${styles.dropdownMenu} ${styles.profileDropdown}`}>
              <div className={styles.dropdownContent}>
                {user && (
                  <div className={styles.profileInfo}>
                    <span className={styles.profileName}>{`${user.first_name || ''} ${user.last_name || ''}`}</span>
                    <span className={styles.profileEmail}>{user.email}</span>
                  </div>
                )}
                
                <Link to="/settings" className={styles.profileMenuItem}>
                  <Settings size={16} />
                  <span>Settings</span>
                </Link>
                
                <button onClick={handleLogout} className={styles.profileMenuItem}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;