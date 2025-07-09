import React, { useState, useEffect } from "react";
import { Plus, Calendar } from "lucide-react";
import { appApi } from "../../../api/axios";
import Cookies from "js-cookie";
import styles from "../Dashboard.module.css";
import projectStyles from "./ProjectModal.module.css";
import { useNavigate } from "react-router-dom";
import { useProjectContext } from "../../../context/ProjectContext";
import Sidebar from "../Sidebar/Sidebar";

const DEFAULT_PROJECT = {
  id: "00000000-0000-0000-0000-000000000000",
  name: "Default Project",
  description: "Default project for new users",
  created_at: new Date().toISOString(),
  is_available: true,
};

const getSessionFromCookies = () => {
  const userId = Cookies.get("user_id");
  const sessionId = Cookies.get("session_id");
  return { user_id: userId, session_id: sessionId };
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [creatingProject, setCreatingProject] = useState(false);
  const navigate = useNavigate();
  const { currentProjectId, setCurrentProjectId } = useProjectContext();

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line
  }, []);

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
      const response = await appApi.get("projects", {
        headers: {
          "X-User-Id": user_id,
          "X-Session-Id": session_id,
        },
        params: { offset: 0, limit: 5 },
        withCredentials: true,
      });
      const { projects: projectsList } = response.data;
      if (!projectsList || projectsList.length === 0) {
        setProjects([]);
      } else {
        const sortedProjects = [...projectsList].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setProjects(sortedProjects);
      }
    } catch (error) {
      setProjects([]);
      setError("Failed to fetch projects.");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (project) => {
    setCurrentProjectId(project.id);
    navigate("/dashboard/main");
  };

  const toggleCreateForm = () => {
    setShowCreateForm((prev) => !prev);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({ ...prev, [name]: value }));
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
      const projectPayload = {
        name: newProject.name,
        description: newProject.description,
        recall_preferences: {
          return_min_top_k: 3,
          return_max_top_k: 10,
          threshold: 0.7,
          classifier: {
            custom_instructions: [],
            false_positive_examples: [],
            false_negative_examples: [],
          },
          subquery_and_keywords_generator: {
            custom_instructions: [],
            subqueries_candidate_nodes_weight: 0,
            subqueries_candidate_memories_weight: 0,
            example_subqueries: [],
            keywords_candidate_nodes_weight: 0,
            keywords_candidate_memories_weight: 0,
            example_keywords: [],
          },
        },
        generation_preferences: {
          custom_instructions: [],
          top_k_symantic_similarity_check: 0,
          raise_merge_conflict: false,
        },
      };
      const response = await appApi.post("projects", projectPayload, {
        headers: {
          "X-User-Id": user_id,
          "X-Session-Id": session_id,
          "Content-Type": "application/json",
        },
      });
      const { project_id } = response.data;
      if (!project_id) {
        throw new Error("Project ID not received from server");
      }
      const projectDetails = await appApi.get(`projects/${project_id}`, {
        headers: {
          "X-User-Id": user_id,
          "X-Session-Id": session_id,
        },
      });
      setNewProject({ name: "", description: "" });
      setShowCreateForm(false);
      fetchProjects();
    } catch (error) {
      if (error.response) {
        const detail = error.response.data?.detail;
        if (Array.isArray(detail) && detail.length > 0) {
          const errorMessages = detail.map((err) => {
            if (err.loc && err.msg) {
              return `${err.loc.join(".")}: ${err.msg}`;
            } else if (typeof err === "string") {
              return err;
            } else {
              return JSON.stringify(err);
            }
          }).join("\n");
          setError(errorMessages);
        } else if (typeof detail === "string") {
          setError(detail);
        } else if (error.response.data?.message) {
          setError(error.response.data.message);
        } else {
          setError(`Error: ${error.response.status} ${error.response.statusText}`);
        }
      } else if (error.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError(error.message || "Failed to create project.");
      }
    } finally {
      setCreatingProject(false);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <Sidebar projectId={currentProjectId || ""} />
      <div className={styles.contentContainer}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "2.5rem 0" }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: "2.5rem", textAlign: "center" }}>
            Project Management
          </h1>
          {projects.length === 0 && !loading && (
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <p style={{ fontSize: "1.15rem", color: "#9CA3AF", marginBottom: 24 }}>
                No active projects.
              </p>
              <button
                onClick={toggleCreateForm}
                style={{
                  background: "linear-gradient(90deg, #3B82F6, #A855F7)",
                  color: "#fff",
                  padding: "0.9rem 2.2rem",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(59,130,246,0.08)",
                  marginTop: 8,
                }}
              >
                <Plus size={18} style={{ marginRight: 8, verticalAlign: -2 }} />
                Create Project
              </button>
            </div>
          )}
          {showCreateForm && (
            <form
              onSubmit={handleCreateProject}
              style={{
                background: "#181F2A",
                borderRadius: 12,
                padding: "2rem 2.2rem 1.5rem 2.2rem",
                marginBottom: 32,
                boxShadow: "0 2px 16px rgba(59,130,246,0.07)",
                maxWidth: 480,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 18 }}>Create New Project</h2>
              <div style={{ marginBottom: 18 }}>
                <label htmlFor="projectName" style={{ display: "block", marginBottom: 6, color: "#fff", fontWeight: 500 }}>
                  Project Name*
                </label>
                <input
                  type="text"
                  id="projectName"
                  name="name"
                  value={newProject.name}
                  onChange={handleInputChange}
                  placeholder="Enter project name"
                  required
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem",
                    borderRadius: 8,
                    border: "1px solid #374151",
                    background: "#232B3A",
                    color: "#fff",
                    fontSize: "1rem",
                  }}
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label htmlFor="projectDescription" style={{ display: "block", marginBottom: 6, color: "#fff", fontWeight: 500 }}>
                  Project Description
                </label>
                <textarea
                  id="projectDescription"
                  name="description"
                  value={newProject.description}
                  onChange={handleInputChange}
                  placeholder="Enter project description"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem",
                    borderRadius: 8,
                    border: "1px solid #374151",
                    background: "#232B3A",
                    color: "#fff",
                    fontSize: "1rem",
                  }}
                />
              </div>
              {error && <div style={{ color: "#EF4444", marginBottom: 12 }}>{error}</div>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button
                  type="button"
                  onClick={toggleCreateForm}
                  style={{
                    background: "none",
                    border: "1px solid #374151",
                    color: "#D1D5DB",
                    borderRadius: 8,
                    padding: "0.7rem 1.5rem",
                    fontWeight: 500,
                    fontSize: "1rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingProject}
                  style={{
                    background: "linear-gradient(90deg, #3B82F6, #A855F7)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "0.7rem 1.5rem",
                    fontWeight: 600,
                    fontSize: "1rem",
                    cursor: creatingProject ? "not-allowed" : "pointer",
                    opacity: creatingProject ? 0.7 : 1,
                  }}
                >
                  {creatingProject ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          )}
          {loading && (
            <div style={{ textAlign: "center", color: "#9CA3AF", margin: "2.5rem 0" }}>
              Loading projects...
            </div>
          )}
          {projects.length > 0 && !loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: "2rem" }}>
              {projects.map((project) => (
                <div
                  key={project.id}
                  style={{
                    background: "#1F2937",
                    borderRadius: 14,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
                    padding: "2rem 1.5rem 1.5rem 1.5rem",
                    border: project.id === currentProjectId ? "2.5px solid #3B82F6" : "1.5px solid #374151",
                    cursor: "pointer",
                    transition: "all 0.18s",
                    position: "relative",
                  }}
                  onClick={() => handleProjectSelect(project)}
                >
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: "#fff", marginBottom: 8, display: "flex", alignItems: "center" }}>
                    {project.name}
                    {project.id === currentProjectId && (
                      <span style={{
                        fontSize: "0.7rem",
                        padding: "0.15rem 0.5rem",
                        background: "linear-gradient(135deg, #3B82F6, #A855F7)",
                        color: "white",
                        borderRadius: 4,
                        marginLeft: 8,
                        verticalAlign: "middle",
                      }}>
                        Current
                      </span>
                    )}
                  </h3>
                  <p style={{ fontSize: "0.97rem", color: "#D1D5DB", margin: 0, marginBottom: 10 }}>
                    {project.description || <span style={{ color: "#6B7280" }}>(No description)</span>}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#9CA3AF", fontSize: "0.93rem" }}>
                    <Calendar size={14} style={{ marginRight: 4 }} />
                    Created: {formatDate(project.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectManagement;
