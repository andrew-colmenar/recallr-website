import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Plus, AlertCircle, Calendar } from "lucide-react";
import { appApi } from "../../../api/axios";
import Cookies from "js-cookie";
import styles from "./ProjectModal.module.css";
import { createPortal } from "react-dom"; // Add this import

// Default project to show when no projects are available
const DEFAULT_PROJECT = {
  id: "00000000-0000-0000-0000-000000000000", // Valid UUID format
  name: "Default Project",
  description: "Default project for new users",
  created_at: new Date().toISOString(),
};

const getSessionFromCookies = () => {
  const userId = Cookies.get("user_id");
  const sessionId = Cookies.get("session_id");

  return {
    user_id: userId,
    session_id: sessionId,
  };
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const ProjectModal = ({
  isOpen,
  onClose,
  onProjectSelect,
  currentProjectId,
}) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
  });
  const [creatingProject, setCreatingProject] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const { user_id, session_id } = getSessionFromCookies();

      if (!user_id || !session_id) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      // Use appApi.get() instead of api() with method parameter
      const response = await appApi.get("projects", {
        headers: {
          "X-User-Id": user_id,
          "X-Session-Id": session_id,
        },
        params: {
          offset: 0,
          limit: 5,
        },
        withCredentials: true,
      });

      // The rest of your code remains the same
      const { projects: projectsList, total, has_more } = response.data;

      setTotal(total || 0);
      setHasMore(has_more || false);

      if (!projectsList || projectsList.length === 0) {
        setProjects([DEFAULT_PROJECT]);
      } else {
        // Sort projects by creation date (newest first)
        const sortedProjects = [...projectsList].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setProjects(sortedProjects);
      }
    } catch (error) {
      // Set default project on error
      setProjects([DEFAULT_PROJECT]);

      if (error.response) {
        switch (error.response.status) {
          case 400:
            setError("Bad request. Please try again.");
            break;
          case 401:
            setError("Authentication required. Please log in again.");
            setTimeout(() => navigate("/login"), 2000);
            break;
          case 403:
            setError("Subscription required to access projects.");
            break;
          case 404:
            setError("Projects endpoint not found. API may be unavailable.");
            break;
          case 422:
            const validationErrors = error.response.data.detail;
            setError(
              `Validation error: ${
                validationErrors?.[0]?.msg || "Please check your request."
              }`
            );
            break;
          case 500:
            setError("Server error. Please try again later.");
            break;
          default:
            setError(
              `Error (${error.response.status}): ${error.response.statusText}`
            );
        }
      } else if (error.request) {
        setError("Network error. Please check your connection and API server.");
      } else {
        setError("Application error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (project) => {
    if (onProjectSelect) {
      onProjectSelect(project);
    }
    // Modal is closed by the parent component via onProjectSelect
    // No need to call onClose() directly here
  };

  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();

    if (!newProject.name.trim()) {
      setError("Project name is required");
      return;
    }

    setCreatingProject(true);
    setError(null);

    try {
      const { user_id, session_id } = getSessionFromCookies();

      if (!user_id || !session_id) {
        setError("Authentication required");
        setCreatingProject(false);
        return;
      }

      // Create the project payload with required fields and sensible defaults
      const projectPayload = {
        name: newProject.name,
        description: newProject.description,
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
          top_k_symantic_similarity_check: 3,
          raise_merge_conflict: true,
        },
      };

      // Try sending without withCredentials to see if that's causing an issue
      const response = await appApi.post("projects", projectPayload, {
        headers: {
          "X-User-Id": user_id,
          "X-Session-Id": session_id,
        },
      });

      // The response contains project_id, not the full project data
      const { project_id } = response.data;

      if (!project_id) {
        throw new Error("Project ID not received from server");
      }

      // Create a project object with the returned ID and form data
      const createdProject = {
        id: project_id,
        name: newProject.name,
        description: newProject.description,
        created_at: new Date().toISOString(),
      };

      // Add the new project to the list
      setProjects((prev) => [
        createdProject,
        ...prev.filter((p) => p.id !== DEFAULT_PROJECT.id),
      ]);

      // Reset the form
      setNewProject({ name: "", description: "" });
      setShowCreateForm(false);

      // Select the newly created project
      handleProjectSelect(createdProject);

      // Refresh the projects list to get the full details from the server
      // This is optional but ensures we have complete project data
      fetchProjects();
    } catch (error) {
      // Add detailed logging to see exactly what's failing
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setError("Invalid project data. Please check your inputs.");
            break;
          case 401:
            setError("Authentication required. Please log in again.");
            setTimeout(() => navigate("/login"), 2000);
            break;
          case 403:
            setError("You do not have permission to create projects.");
            break;
          case 422:
            const validationErrors = error.response.data.detail;
            if (
              Array.isArray(validationErrors) &&
              validationErrors.length > 0
            ) {
              setError(`Validation error: ${validationErrors[0].msg}`);
            } else if (typeof error.response.data.detail === "string") {
              setError(`Validation error: ${error.response.data.detail}`);
            } else {
              setError("Validation error: Please check your inputs.");
            }
            break;
          case 500:
            setError("Server error. Please try again later.");
            break;
          default:
            setError(
              `Error (${error.response.status}): ${error.response.statusText}`
            );
        }
      } else if (error.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("An error occurred while creating the project.");
      }
    } finally {
      setCreatingProject(false);
    }
  };

  if (!isOpen) return null;

  // Use createPortal to render the modal at the document body level
  return createPortal(
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {showCreateForm ? "Create New Project" : "Select Project"}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {error && (
            <div className={styles.errorMessage}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {showCreateForm ? (
            <form onSubmit={handleCreateProject} className={styles.createForm}>
              <div className={styles.formGroup}>
                <label htmlFor="projectName">Project Name*</label>
                <input
                  type="text"
                  id="projectName"
                  name="name"
                  value={newProject.name}
                  onChange={handleInputChange}
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="projectDescription">Project Description</label>
                <textarea
                  id="projectDescription"
                  name="description"
                  value={newProject.description}
                  onChange={handleInputChange}
                  placeholder="Enter project description"
                  rows="4"
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={toggleCreateForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={creatingProject}
                >
                  {creatingProject ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          ) : loading ? (
            <div className={styles.loadingIndicator}>
              <div className={styles.spinner}></div>
              <span>Loading projects...</span>
            </div>
          ) : projects.length > 0 ? (
            <div className={styles.projectList}>
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`${styles.projectItem} ${
                    project.id === currentProjectId ? styles.projectActive : ""
                  }`}
                  onClick={() => handleProjectSelect(project)}
                >
                  <div className={styles.projectInfo}>
                    <h3 className={styles.projectName}>
                      {project.name}
                      {project.id === currentProjectId && (
                        <span className={styles.currentTag}>Current</span>
                      )}
                    </h3>
                    <p className={styles.projectId}>ID: {project.id}</p>
                    {project.description && (
                      <p className={styles.projectDescription}>
                        {project.description}
                      </p>
                    )}
                    <div className={styles.projectMeta}>
                      <span className={styles.projectDate}>
                        <Calendar size={12} />
                        Created: {formatDate(project.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <AlertCircle size={32} />
              </div>
              <h3>No Projects Found</h3>
              <p>
                You haven't created any projects yet. Create a new project to
                get started.
              </p>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          {!showCreateForm && (
            <button className={styles.createButton} onClick={toggleCreateForm}>
              <Plus size={16} />
              <span>Create New Project</span>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body // This ensures the modal is mounted at the body level
  );
};

export default ProjectModal;
