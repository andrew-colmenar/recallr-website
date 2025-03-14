import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import ProjectModal from "../Projects/ProjectModal";
import styles from './Header.module.css';
import { useAuth } from '../../context/AuthContext';
import { appApi } from "../../api/axios";
import Cookies from 'js-cookie';

const DEFAULT_PROJECT = {
  id: "default-project-id",
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const profileRef = useRef(null);
  const projectIdRef = useRef(null);

  // Log when component renders
  console.log("Header component rendered");

  // Update current project when URL search params change
  useEffect(() => {
    // Get project ID from URL
    const projectId = searchParams.get('project');
    console.log("Project ID from URL:", projectId);
    
    // Skip re-fetching if we already have this project loaded
    if (projectId === projectIdRef.current) {
      console.log("Project already loaded, skipping fetch");
      return;
    }
    
    // Update the ref with current projectId
    projectIdRef.current = projectId;
    
    if (!projectId) {
      console.log("No project ID, using default project");
      setCurrentProject(DEFAULT_PROJECT);
      return;
    }
    
    // If there's a project ID, fetch the project details
    const fetchProjectDetails = async () => {
      console.log("Fetching project details for ID:", projectId);
      setLoading(true);
      setError(null);
      
      try {
        const user_id = Cookies.get('user_id');
        const session_id = Cookies.get('session_id');
        
        if (!user_id || !session_id) {
          throw new Error('Authentication required');
        }
        
        const response = await appApi.get(`projects/${projectId}`, {
          headers: {
            'X-User-Id': user_id,
            'X-Session-Id': session_id
          }
        });
        
        console.log("Project details fetched:", response.data);
        setCurrentProject(response.data);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError(err.message || 'Failed to load project details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectDetails();
  }, [searchParams, location.search]); // Watch for changes in location.search as well

  // Debug logging of current project state
  useEffect(() => {
    console.log("Current project state:", currentProject);
  }, [currentProject]);

  const handleProjectSelect = (project) => {
    console.log("Project selected:", project);
    setCurrentProject(project);
    projectIdRef.current = project.id;
    
    // If we're on a dashboard path, preserve the current route with the new project
    if (location.pathname.startsWith('/dashboard/')) {
      const routePart = location.pathname.split('/dashboard/')[1] || 'settings';
      navigate(`/dashboard/${routePart}?project=${project.id}`);
    } else {
      // Otherwise, go to settings with the selected project
      navigate(`/dashboard/settings?project=${project.id}`);
    }
    
    // Close the modal after project selection
    setIsProjectModalOpen(false);
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
        {/* Only show project dropdown on dashboard pages */}
        {location.pathname.startsWith('/dashboard/') && (
          <div className={styles.projectDropdown}>
            <button
              className={styles.projectDropdownButton}
              onClick={() => setIsProjectModalOpen(true)}
              title={loading ? "Loading project..." : currentProject.name}
            >
              <span className={styles.orgName}>
                {loading ? "Loading..." : currentProject.name || "Select Project"}
              </span>
              <ChevronDown className={styles.dropdownIcon} />
            </button>

            <ProjectModal 
              isOpen={isProjectModalOpen} 
              onClose={() => setIsProjectModalOpen(false)} 
              onProjectSelect={handleProjectSelect}
              currentProjectId={projectIdRef.current}
            />
          </div>
        )}
      </div>

      <div className={styles.headerRight}>
        <Link 
          to={currentProject.id !== DEFAULT_PROJECT.id ? `/dashboard?project=${currentProject.id}` : "/dashboard"}
          className={`${styles.navLink} ${location.pathname === "/dashboard" ? styles.active : ""}`}
        >
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
            <span className={styles.avatarText}>{user?.first_name?.[0] || 'U'}</span>
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