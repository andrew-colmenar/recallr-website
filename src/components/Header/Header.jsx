import React, { useState, useEffect, useRef } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { ChevronDown, LogOut } from "lucide-react";
import ProjectModal from "../Dashboard/Projects/ProjectModal";
import styles from "./Header.module.css";
import { useAuth } from "../../context/AuthContext";
import { appApi } from "../../api/axios";
import Cookies from "js-cookie";
import { useProjectContext } from "../../context/ProjectContext";

const DEFAULT_PROJECT = {
  id: "00000000-0000-0000-0000-000000000000",
  name: "Default Project",
  description: "Default project for new users",
  created_at: new Date().toISOString(),
  is_available: true,
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
  const { currentProjectId, setCurrentProjectId } = useProjectContext();

  // Check if current path is dashboard or starts with dashboard
  const isDashboardActive =
    location.pathname === "/dashboard" ||
    location.pathname.startsWith("/dashboard");

  useEffect(() => {
    // Use projectId from context as the source of truth
    const projectId = currentProjectId;
    if (!projectId) {
      setCurrentProject(DEFAULT_PROJECT);
      return;
    }
    // If there's a project ID, fetch the project details
    const fetchProjectDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const user_id = Cookies.get("user_id");
        const session_id = Cookies.get("session_id");
        if (!user_id || !session_id) {
          throw new Error("Authentication required");
        }
        const response = await appApi.get(`projects/${projectId}`, {
          headers: {
            "X-User-Id": user_id,
            "X-Session-Id": session_id,
          },
        });
        setCurrentProject(response.data);
        setCurrentProjectId(response.data.id); // Ensure context stays in sync
      } catch (err) {
        setError("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };
    fetchProjectDetails();
  }, [currentProjectId, setCurrentProject, setCurrentProjectId]);

  const handleProjectSelect = (project) => {
    setCurrentProject(project);
    setCurrentProjectId(project.id);
    // If we're on a dashboard path, preserve the current route with the new project
    if (location.pathname.startsWith("/dashboard/")) {
      const routePart = location.pathname.split("/dashboard/")[1] || "project-settings";
      navigate(`/dashboard/${routePart}?project=${project.id}`);
    } else {
      // Otherwise, go to project-settings with the selected project
      navigate(`/dashboard/project-settings?project=${project.id}`);
    }
    setIsProjectModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      // Silently fail in production
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      // Close profile dropdown if clicked outside
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.LogoContainer}>
          <span className={styles.Title}>Recallr AI</span>
        </div>
      </div>

      <div className={styles.headerRight}>
        <Link
          to="/dashboard/main"
          className={`${styles.navLink} ${
            isDashboardActive ? styles.active : ""
          }`}
        >
          <span className={styles.navLinkText}>Dashboard</span>
        </Link>

        {/* Project selector - now on the right side, next to Dashboard */}
        {location.pathname.startsWith("/dashboard/") && (
          <div className={styles.projectSelectorRight}>
            <button
              className={styles.projectSelectorButton}
              onClick={() => setIsProjectModalOpen(true)}
            >
              <span className={styles.projectName}>
                {loading
                  ? "Loading..."
                  : !currentProjectId
                    ? "No project selected"
                    : currentProject.name || "Select Project"}
              </span>
              <ChevronDown className={styles.dropdownIcon} />
            </button>

            <ProjectModal
              isOpen={isProjectModalOpen}
              onClose={() => setIsProjectModalOpen(false)}
              onProjectSelect={handleProjectSelect}
              currentProjectId={currentProjectId}
            />
          </div>
        )}

        <div className={styles.userProfile} ref={profileRef}>
          <div
            className={styles.avatar}
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          >
            <span className={styles.avatarText}>
              {user?.first_name?.[0] || "U"}
            </span>
          </div>

          {isProfileMenuOpen && (
            <div className={`${styles.dropdownMenu} ${styles.profileDropdown}`}>
              <div className={styles.dropdownContent}>
                {user && (
                  <div className={styles.profileInfo}>
                    <span className={styles.profileName}>{`${
                      user.first_name || ""
                    } ${user.last_name || ""}`}</span>
                    <span className={styles.profileEmail}>{user.email}</span>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className={styles.profileMenuItem}
                >
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
