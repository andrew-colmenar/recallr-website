import React, { useEffect, useState, useCallback } from "react";
import {
  Routes,
  Route,
  useSearchParams,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import { appApi } from "../../api/axios";
import Cookies from "js-cookie";
import Sidebar from "./Sidebar/Sidebar";
// import ComingSoon from "../ComingSoon/ComingSoon";
import Users from "./Users/Users";
import styles from "./Dashboard.module.css";
import APIKeys from "./APIKeys/APIKeys";
import ProjectSettings from "./Settings/ProjectSettings";
import Payment from "../Billing/Payment/Payment";
import { useProjectContext } from "../../context/ProjectContext";

// use postman     
// Default project to use when no project ID is specified or on error
// Using a valid UUID format for the default project ID
const DEFAULT_PROJECT = {
  id: "00000000-0000-0000-0000-000000000000", // Valid UUID format
  name: "Default Project",
  description: "Default project for new users",
  recall_preferences: {
    classifier: {
      custom_instructions: [],
      false_positive_examples: [],
      false_negative_examples: [],
    },
    subquery_and_keywords_generator: {
      custom_instructions: [],
      subqueries_candidate_nodes_weight: 0,
      example_subqueries: [],
      keywords_candidate_nodes_weight: 0,
      example_keywords: [],
    },
  },
  generation_preferences: {
    custom_instructions: [],
    top_k_symantic_similarity_check: 0,
    raise_merge_conflict: false,
  },
  created_at: new Date().toISOString(),
};

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [currentProject, setCurrentProject] = useState(DEFAULT_PROJECT);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentProjectId } = useProjectContext();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check if authentication is ready
  const checkAuth = useCallback(() => {
    const user_id = Cookies.get("user_id");
    const session_id = Cookies.get("session_id");

    return {
      isAuthenticated: !!(user_id && session_id),
      user_id,
      session_id,
    };
  }, []);

  // First, check if authentication is ready
  useEffect(() => {
    const waitForAuth = () => {
      const { isAuthenticated } = checkAuth();

      if (isAuthenticated) {
        setAuthChecked(true);
      } else {
        // Check again after a short delay
        setTimeout(waitForAuth, 500);
      }
    };

    waitForAuth();
  }, [checkAuth]);

  // Once authentication is ready, fetch projects
  useEffect(() => {
    if (!authChecked) {
      return; // Wait until auth is checked
    }

    const fetchProjects = async () => {
      try {
        const { isAuthenticated, user_id, session_id } = checkAuth();

        if (!isAuthenticated) {
          setTimeout(fetchProjects, 1000);
          return;
        }

        const response = await appApi.get("/projects", {
          headers: {
            "X-User-Id": user_id,
            "X-Session-Id": session_id,
          },
          params: {
            offset: 0,
            limit: 100,
          },
        });

        const { projects: projectsList } = response.data;

        setProjects(projectsList || []);

        // If no project is selected in URL but user has projects, redirect to latest project
        if (!currentProjectId && projectsList && projectsList.length > 0) {
          // Sort by creation date (newest first) and redirect to project-settings
          const sortedProjects = [...projectsList].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );

          navigate(`/dashboard/project-settings?project=${sortedProjects[0].id}`, {
            replace: true,
          });
          return;
        }

        // If no projects exist and no project is selected, show the create project page
        // instead of trying to fetch a non-existent default project
        if ((!projectsList || projectsList.length === 0) && !currentProjectId) {
          // Just use the default project without fetching from backend
          setCurrentProject(DEFAULT_PROJECT);
          setLoading(false);

          // Navigate to project-settings with a special query param indicating new user
          navigate(`/dashboard/project-settings?newUser=true`, { replace: true });
          return;
        }

        // If projects exist and a project ID is provided, fetch that project's details
        if (currentProjectId) {
          fetchProjectDetails(currentProjectId);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          // Redirect to login if unauthorized
          navigate("/login", { replace: true });
          return;
        }

        // For other errors, proceed to project details
        if (currentProjectId) {
          fetchProjectDetails(currentProjectId);
        } else {
          setLoading(false);
        }
      }
    };

    fetchProjects();
  }, [authChecked, currentProjectId, navigate, checkAuth]);

  // Only fetch project details if projectId changes or currentProject is missing/mismatched
  const fetchProjectDetails = useCallback(async (projId) => {
    if (!projId) {
      setCurrentProject(DEFAULT_PROJECT);
      setLoading(false);
      return;
    }

    if (projId === DEFAULT_PROJECT.id) {
      setCurrentProject(DEFAULT_PROJECT);
      setLoading(false);
      return;
    }

    // Only fetch if we don't already have the correct project
    if (currentProject && currentProject.id === projId) {
      setLoading(false);
      return;
    }

    const { isAuthenticated, user_id, session_id } = checkAuth();

    if (!isAuthenticated) {
      setCurrentProject(DEFAULT_PROJECT);
      setLoading(false);
      return;
    }

    // Set timeout for project loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        setError("Loading is taking longer than expected. Please wait...");
      }
    }, 10000);

    try {
      const response = await appApi.get(`/projects/${projId}`, {
        headers: {
          "X-User-Id": user_id,
          "X-Session-Id": session_id,
        },
      });

      setCurrentProject(response.data);
      setError(null); // Clear any previous errors
    } catch (err) {
      // Handle different error responses
      if (err.response) {
        switch (err.response.status) {
          case 400:
            setError("Bad request. Please check your request parameters.");
            break;
          case 401:
            setError("Authentication required. Please log in again.");
            setTimeout(() => navigate("/login"), 3000);
            break;
          case 403:
            setError(
              "You don't have access to this project or subscription required."
            );
            break;
          case 404:
            setError(`Project not found: ${projId}`);

            // Check if there are other projects to redirect to
            if (projects.length > 0) {
              // Sort by creation date (newest first)
              const sortedProjects = [...projects].sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
              );
              setTimeout(
                () =>
                  navigate(
                    `/dashboard/project-settings?project=${sortedProjects[0].id}`
                  ),
                3000
              );
            } else {
              // No projects, show the create project view
              setTimeout(
                () => navigate(`/dashboard/project-settings?newUser=true`),
                3000
              );
            }
            break;
          case 422:
            const validationErrors = err.response.data.detail;
            setError(
              `Validation error: ${
                validationErrors?.[0]?.msg || "Please check your request."
              }`
            );

            // Use default project for now, but don't try to load it from the backend
            setCurrentProject(DEFAULT_PROJECT);
            break;
          case 500:
            setError("Server error. Please try again later.");
            break;
          default:
            setError(
              `Error: ${err.response.status} - ${err.response.statusText}`
            );
        }
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError(err.message || "An error occurred while loading the project.");
      }

      // Use default project after timeout
      setTimeout(() => {
        if (loading) {
          setCurrentProject(DEFAULT_PROJECT);
          setLoading(false);
        }
      }, 2000); // Reduced timeout for better UX
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [currentProject, checkAuth, loading, projects, navigate]);

  // Helper: is this a footer route?
  const isFooterRoute = () => {
    const path = location.pathname;
    return (
      path.includes("/getstarted") ||
      path.includes("/contact-help") ||
      path.includes("/status") ||
      path.includes("/payment")
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingMessage}>
          {error ? error : "Loading project data..."}
        </p>
        <p className={styles.loadingSubtext}>
          {!authChecked
            ? "Verifying your session..."
            : "This might take a moment. Please wait..."}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      <Sidebar projectId={currentProjectId || ""} onCollapseChange={setSidebarCollapsed} />
      <div className={`${styles.contentContainer}${sidebarCollapsed ? ' ' + styles.collapsed : ''}`}>
        {error && <div className={styles.errorBanner}>{error}</div>}
        {/* Overlay if not in a project and not on a footer route and not on project-settings */}
        {currentProject && currentProject.id === DEFAULT_PROJECT.id && !isFooterRoute() && !location.pathname.includes("/project-settings") && (
          <div className={styles.projectOverlay}>
            <div className={styles.projectOverlayContent}>
              <h1>Please select or create a project first</h1>
              <p>You need to select or create a project before using this page.</p>
            </div>
          </div>
        )}
        <main className={`${styles.main}${sidebarCollapsed ? ' ' + styles.collapsed : ''}`} style={currentProject && currentProject.id === DEFAULT_PROJECT.id && !isFooterRoute() && !location.pathname.includes("/project-settings") ? { filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none' } : {}}>
          <Routes>
            <Route
              index
              element={
                <Navigate
                  to={`project-settings${
                    currentProjectId ? `?project=${currentProjectId}` : "?newUser=true"
                  }`}
                  replace
                />
              }
            />
            {/* <Route path="usage" element={<ComingSoon project={currentProject} />} /> */}
            <Route
              path="users"
              element={
                !currentProjectId ? (
                  <div className={styles.projectOverlay}>
                    <div className={styles.projectOverlayContent}>
                      <h1>Please select or create a project first</h1>
                      <p>You need to select or create a project before using this page.</p>
                    </div>
                  </div>
                ) : (
                  <Users projectId={currentProjectId} />
                )
              }
            />
            <Route
              path="apikeys"
              element={
                !currentProjectId ? (
                  <div className={styles.projectOverlay}>
                    <div className={styles.projectOverlayContent}>
                      <h1>Please select or create a project first</h1>
                      <p>You need to select or create a project before using this page.</p>
                    </div>
                  </div>
                ) : (
                  <APIKeys projectId={currentProjectId} />
                )
              }
            />
            <Route
              path="project-settings"
              element={
                !currentProjectId ? (
                  <div className={styles.projectOverlay}>
                    <div className={styles.projectOverlayContent}>
                      <h1>Please select or create a project first</h1>
                      <p>You need to select or create a project before using this page.</p>
                    </div>
                  </div>
                ) : (
                  <ProjectSettings />
                )
              }
            />
            <Route
              path="payment"
              element={<Payment />}
            />
            {/* <Route path="*" element={<ComingSoon project={currentProject} />} /> */}
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
