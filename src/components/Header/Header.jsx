import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronDown, Plus, LogOut, Settings } from "lucide-react";
import ProjectModal from "../Projects/ProjectModal";
import styles from './Header.module.css';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_PROJECT = {
  id: "default-id",
  name: "Default Project",
  description: "Default project for new users",
  created_at: new Date().toISOString(),
  is_available: true
};

const Header = () => {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(DEFAULT_PROJECT);
  const [searchParams] = useSearchParams();
  
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const profileRef = useRef(null);

  // Update current project when URL search params change
  useEffect(() => {
    const projectId = searchParams.get('project');
    
    // If no project ID in URL, use default
    if (!projectId) {
      setCurrentProject(DEFAULT_PROJECT);
    }
    // Don't set current project here if it has a project ID
    // The Dashboard component will fetch the full project details
  }, [searchParams]);

  const handleProjectSelect = (project) => {
    setCurrentProject(project);
  };

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
        <div className={styles.projectDropdown}>
          <button
            className={styles.projectDropdownButton}
            onClick={() => setIsProjectModalOpen(true)}
          >
            <span className={styles.orgName}>{currentProject.name}</span>
            <ChevronDown className={styles.dropdownIcon} />
          </button>

          <ProjectModal 
            isOpen={isProjectModalOpen} 
            onClose={() => setIsProjectModalOpen(false)} 
            onProjectSelect={handleProjectSelect}
          />
        </div>
      </div>

      <div className={styles.headerRight}>
        <Link to="/dashboard" className={`${styles.navLink} ${location.pathname === "/dashboard" ? styles.active : ""}`}>
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