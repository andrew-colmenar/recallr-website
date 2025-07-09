import React, { useState, useEffect } from "react";
import { Plus, Calendar, Info } from "lucide-react";
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

const FIELD_INFO = {
  return_min_top_k: "Minimum number of top results to return for recall queries.",
  return_max_top_k: "Maximum number of top results to return for recall queries.",
  threshold: "Similarity threshold for considering a result relevant (0-1).",
  top_k_symantic_similarity_check: "Number of top results to check for semantic similarity.",
  raise_merge_conflict: "If enabled, merge conflicts will be raised during generation.",
  'recall_preferences.classifier.custom_instructions': "Custom instructions for the classifier module.",
  'recall_preferences.classifier.false_positive_examples': "Examples that should NOT be classified as relevant (false positives).",
  'recall_preferences.classifier.false_negative_examples': "Examples that SHOULD be classified as relevant (false negatives).",
  'recall_preferences.subquery_and_keywords_generator.custom_instructions': "Custom instructions for the subquery and keywords generator.",
  'recall_preferences.subquery_and_keywords_generator.subqueries_candidate_nodes_weight': "Weight for subqueries candidate nodes.",
  'recall_preferences.subquery_and_keywords_generator.subqueries_candidate_memories_weight': "Weight for subqueries candidate memories.",
  'recall_preferences.subquery_and_keywords_generator.example_subqueries': "Example subqueries for the generator.",
  'recall_preferences.subquery_and_keywords_generator.keywords_candidate_nodes_weight': "Weight for keywords candidate nodes.",
  'recall_preferences.subquery_and_keywords_generator.keywords_candidate_memories_weight': "Weight for keywords candidate memories.",
  'recall_preferences.subquery_and_keywords_generator.example_keywords': "Example keywords for the generator.",
  'generation_preferences.custom_instructions': "Custom instructions for the generation module.",
};

function InfoTooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-block", marginLeft: 6 }}>
      <Info size={16} style={{ cursor: "pointer", color: "#60A5FA" }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        tabIndex={0}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
      />
      {show && (
        <span style={{
          position: "absolute",
          left: 22,
          top: -8,
          background: "#232B3A",
          color: "#fff",
          borderRadius: 6,
          padding: "0.5rem 0.9rem",
          fontSize: "0.97rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          zIndex: 100,
          minWidth: 220,
        }}>{text}</span>
      )}
    </span>
  );
}

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    return_min_top_k: 3,
    return_max_top_k: 10,
    threshold: 0.7,
    top_k_symantic_similarity_check: 0,
    raise_merge_conflict: false,
  });
  const [creatingProject, setCreatingProject] = useState(false);
  const navigate = useNavigate();
  const { currentProjectId, setCurrentProjectId } = useProjectContext();
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedFields, setAdvancedFields] = useState({
    'recall_preferences.classifier.custom_instructions': [],
    'recall_preferences.classifier.false_positive_examples': [],
    'recall_preferences.classifier.false_negative_examples': [],
    'recall_preferences.subquery_and_keywords_generator.custom_instructions': [],
    'recall_preferences.subquery_and_keywords_generator.subqueries_candidate_nodes_weight': 0,
    'recall_preferences.subquery_and_keywords_generator.subqueries_candidate_memories_weight': 0,
    'recall_preferences.subquery_and_keywords_generator.example_subqueries': [],
    'recall_preferences.subquery_and_keywords_generator.keywords_candidate_nodes_weight': 0,
    'recall_preferences.subquery_and_keywords_generator.keywords_candidate_memories_weight': 0,
    'recall_preferences.subquery_and_keywords_generator.example_keywords': [],
    'generation_preferences.custom_instructions': [],
  });

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
    const { name, value, type, checked } = e.target;
    setNewProject((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAdvancedFieldChange = (field, value) => {
    setAdvancedFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdvancedArrayChange = (field, idx, value) => {
    setAdvancedFields((prev) => {
      const arr = [...prev[field]];
      arr[idx] = value;
      return { ...prev, [field]: arr };
    });
  };

  const handleAdvancedArrayAdd = (field) => {
    setAdvancedFields((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const handleAdvancedArrayRemove = (field, idx) => {
    setAdvancedFields((prev) => {
      const arr = [...prev[field]];
      arr.splice(idx, 1);
      return { ...prev, [field]: arr };
    });
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
          return_min_top_k: Number(newProject.return_min_top_k),
          return_max_top_k: Number(newProject.return_max_top_k),
          threshold: Number(newProject.threshold),
          classifier: {
            custom_instructions: advancedFields['recall_preferences.classifier.custom_instructions'],
            false_positive_examples: advancedFields['recall_preferences.classifier.false_positive_examples'],
            false_negative_examples: advancedFields['recall_preferences.classifier.false_negative_examples'],
          },
          subquery_and_keywords_generator: {
            custom_instructions: advancedFields['recall_preferences.subquery_and_keywords_generator.custom_instructions'],
            subqueries_candidate_nodes_weight: Number(advancedFields['recall_preferences.subquery_and_keywords_generator.subqueries_candidate_nodes_weight']),
            subqueries_candidate_memories_weight: Number(advancedFields['recall_preferences.subquery_and_keywords_generator.subqueries_candidate_memories_weight']),
            example_subqueries: advancedFields['recall_preferences.subquery_and_keywords_generator.example_subqueries'],
            keywords_candidate_nodes_weight: Number(advancedFields['recall_preferences.subquery_and_keywords_generator.keywords_candidate_nodes_weight']),
            keywords_candidate_memories_weight: Number(advancedFields['recall_preferences.subquery_and_keywords_generator.keywords_candidate_memories_weight']),
            example_keywords: advancedFields['recall_preferences.subquery_and_keywords_generator.example_keywords'],
          },
        },
        generation_preferences: {
          custom_instructions: advancedFields['generation_preferences.custom_instructions'],
          top_k_symantic_similarity_check: Number(newProject.top_k_symantic_similarity_check),
          raise_merge_conflict: Boolean(newProject.raise_merge_conflict),
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
      setNewProject({
        name: "",
        description: "",
        return_min_top_k: 3,
        return_max_top_k: 10,
        threshold: 0.7,
        top_k_symantic_similarity_check: 0,
        raise_merge_conflict: false,
      });
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

  const handleProjectCardClick = async (project) => {
    setDetailsLoading(true);
    setDetailsError(null);
    setSelectedProject(project); // For modal open/close
    try {
      const { user_id, session_id } = getSessionFromCookies();
      const response = await appApi.get(`projects/${project.id}`, {
        headers: {
          "X-User-Id": user_id,
          "X-Session-Id": session_id,
        },
      });
      setProjectDetails(response.data);
    } catch (err) {
      setProjectDetails(null);
      setDetailsError("Failed to load project details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleAssignAsCurrent = () => {
    setCurrentProjectId(projectDetails.id);
    setSelectedProject(null);
    setProjectDetails(null);
    setDetailsError(null);
  };

  const handleEditParameters = () => {
    setCurrentProjectId(projectDetails.id);
    setSelectedProject(null);
    setProjectDetails(null);
    setDetailsError(null);
    navigate(`/dashboard/settings`);
  };

  const handleDeleteProject = async () => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    try {
      const { user_id, session_id } = getSessionFromCookies();
      await appApi.delete(`projects/${projectDetails.id}`, {
        headers: {
          "X-User-Id": user_id,
          "X-Session-Id": session_id,
        },
      });
      setSelectedProject(null);
      setProjectDetails(null);
      setDetailsError(null);
      fetchProjects();
    } catch (err) {
      setDetailsError("Failed to delete project.");
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
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
            <button
              onClick={toggleCreateForm}
              style={{
                background: "linear-gradient(90deg, #3B82F6, #A855F7)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "0.7rem 1.5rem",
                fontWeight: 600,
                fontSize: "1rem",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(59,130,246,0.10)",
              }}
            >
              + Create Project
            </button>
          </div>
          {projects.length === 0 && !loading && (
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <p style={{ fontSize: "1.15rem", color: "#9CA3AF", marginBottom: 24 }}>
                No active projects.
              </p>
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
              <div style={{ marginBottom: 18 }}>
                <label htmlFor="return_min_top_k" style={{ display: "block", marginBottom: 6, color: "#fff", fontWeight: 500 }}>
                  Return Min Top K
                  <InfoTooltip text={FIELD_INFO.return_min_top_k} />
                </label>
                <input
                  type="number"
                  id="return_min_top_k"
                  name="return_min_top_k"
                  value={newProject.return_min_top_k}
                  onChange={handleInputChange}
                  min={1}
                  max={10}
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
                <label htmlFor="return_max_top_k" style={{ display: "block", marginBottom: 6, color: "#fff", fontWeight: 500 }}>
                  Return Max Top K
                  <InfoTooltip text={FIELD_INFO.return_max_top_k} />
                </label>
                <input
                  type="number"
                  id="return_max_top_k"
                  name="return_max_top_k"
                  value={newProject.return_max_top_k}
                  onChange={handleInputChange}
                  min={1}
                  max={10}
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
                <label htmlFor="threshold" style={{ display: "block", marginBottom: 6, color: "#fff", fontWeight: 500 }}>
                  Threshold
                  <InfoTooltip text={FIELD_INFO.threshold} />
                </label>
                <input
                  type="number"
                  id="threshold"
                  name="threshold"
                  value={newProject.threshold}
                  onChange={handleInputChange}
                  min={0}
                  max={1}
                  step={0.01}
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
                <label htmlFor="top_k_symantic_similarity_check" style={{ display: "block", marginBottom: 6, color: "#fff", fontWeight: 500 }}>
                  Top K Symantic Similarity Check
                  <InfoTooltip text={FIELD_INFO.top_k_symantic_similarity_check} />
                </label>
                <input
                  type="number"
                  id="top_k_symantic_similarity_check"
                  name="top_k_symantic_similarity_check"
                  value={newProject.top_k_symantic_similarity_check}
                  onChange={handleInputChange}
                  min={0}
                  max={5}
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
                <label htmlFor="raise_merge_conflict" style={{ display: "block", marginBottom: 6, color: "#fff", fontWeight: 500 }}>
                  Raise Merge Conflict
                  <InfoTooltip text={FIELD_INFO.raise_merge_conflict} />
                </label>
                <input
                  type="checkbox"
                  id="raise_merge_conflict"
                  name="raise_merge_conflict"
                  checked={newProject.raise_merge_conflict}
                  onChange={handleInputChange}
                  style={{ marginRight: 8 }}
                />
                <span style={{ color: "#D1D5DB", fontSize: "1rem" }}>
                  {newProject.raise_merge_conflict ? "Enabled" : "Disabled"}
                </span>
              </div>
              {/* Advanced Settings Section */}
              <div style={{ marginBottom: 18 }}>
                <button
                  type="button"
                  onClick={() => setShowAdvanced((prev) => !prev)}
                  style={{
                    background: showAdvanced ? "#232B3A" : "#1F2937",
                    color: "#fff",
                    border: "1px solid #374151",
                    borderRadius: 8,
                    padding: "0.7rem 1.5rem",
                    fontWeight: 500,
                    fontSize: "1rem",
                    cursor: "pointer",
                    marginBottom: 8,
                    width: "100%",
                    textAlign: "left",
                  }}
                >
                  {showAdvanced ? "▼" : "►"} Advanced Settings
                </button>
                {showAdvanced && (
                  <div style={{ background: "#232B3A", borderRadius: 8, padding: "1.2rem 1.2rem 0.5rem 1.2rem", marginTop: 4 }}>
                    {/* Array fields */}
                    {[
                      'recall_preferences.classifier.custom_instructions',
                      'recall_preferences.classifier.false_positive_examples',
                      'recall_preferences.classifier.false_negative_examples',
                      'recall_preferences.subquery_and_keywords_generator.custom_instructions',
                      'recall_preferences.subquery_and_keywords_generator.example_subqueries',
                      'recall_preferences.subquery_and_keywords_generator.example_keywords',
                      'generation_preferences.custom_instructions',
                    ].map((field) => (
                      <div key={field} style={{ marginBottom: 18 }}>
                        <label style={{ display: "block", marginBottom: 6, color: "#fff", fontWeight: 500 }}>
                          {field.split('.').slice(-1)[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          <InfoTooltip text={FIELD_INFO[field]} />
                        </label>
                        {advancedFields[field].map((item, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                            <input
                              type="text"
                              value={item}
                              onChange={e => handleAdvancedArrayChange(field, idx, e.target.value)}
                              style={{
                                flex: 1,
                                padding: "0.7rem 1rem",
                                borderRadius: 8,
                                border: "1px solid #374151",
                                background: "#181F2A",
                                color: "#fff",
                                fontSize: "1rem",
                                marginRight: 8,
                              }}
                            />
                            <button type="button" onClick={() => handleAdvancedArrayRemove(field, idx)} style={{ color: "#EF4444", background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>×</button>
                          </div>
                        ))}
                        <button type="button" onClick={() => handleAdvancedArrayAdd(field)} style={{ color: "#3B82F6", background: "none", border: "none", fontWeight: 500, fontSize: "1rem", cursor: "pointer" }}>+ Add</button>
                      </div>
                    ))}
                    {/* Number fields */}
                    {[
                      'recall_preferences.subquery_and_keywords_generator.subqueries_candidate_nodes_weight',
                      'recall_preferences.subquery_and_keywords_generator.subqueries_candidate_memories_weight',
                      'recall_preferences.subquery_and_keywords_generator.keywords_candidate_nodes_weight',
                      'recall_preferences.subquery_and_keywords_generator.keywords_candidate_memories_weight',
                    ].map((field) => (
                      <div key={field} style={{ marginBottom: 18 }}>
                        <label style={{ display: "block", marginBottom: 6, color: "#fff", fontWeight: 500 }}>
                          {field.split('.').slice(-1)[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          <InfoTooltip text={FIELD_INFO[field]} />
                        </label>
                        <input
                          type="number"
                          value={advancedFields[field]}
                          onChange={e => handleAdvancedFieldChange(field, e.target.value)}
                          style={{
                            width: "100%",
                            padding: "0.7rem 1rem",
                            borderRadius: 8,
                            border: "1px solid #374151",
                            background: "#181F2A",
                            color: "#fff",
                            fontSize: "1rem",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
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
                  onClick={() => handleProjectCardClick(project)}
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

          {/* Project Details Modal */}
          {selectedProject && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.45)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => {
                setSelectedProject(null);
                setProjectDetails(null);
                setDetailsError(null);
              }}
            >
              <div
                style={{
                  background: "#181F2A",
                  borderRadius: 14,
                  padding: "2.5rem 2.5rem 2rem 2.5rem",
                  minWidth: 400,
                  maxWidth: 600,
                  boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
                  color: "#fff",
                  position: "relative",
                }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    setProjectDetails(null);
                    setDetailsError(null);
                  }}
                  style={{
                    position: "absolute",
                    top: 18,
                    right: 18,
                    background: "none",
                    border: "none",
                    color: "#D1D5DB",
                    fontSize: 22,
                    cursor: "pointer",
                  }}
                  title="Close"
                >
                  ×
                </button>
                {detailsLoading ? (
                  <div style={{ color: "#9CA3AF", textAlign: "center", padding: "2rem 0" }}>Loading project details...</div>
                ) : detailsError ? (
                  <div style={{ color: "#EF4444", textAlign: "center", padding: "2rem 0" }}>{detailsError}</div>
                ) : projectDetails ? (
                  <>
                    <h2 style={{ fontSize: "1.4rem", marginBottom: 12 }}>{projectDetails.name}</h2>
                    <p style={{ color: "#9CA3AF", marginBottom: 18 }}>{projectDetails.description}</p>
                    <div style={{ fontSize: "0.97rem", marginBottom: 10 }}>
                      <b>Created:</b> {formatDate(projectDetails.created_at)}
                    </div>
                    <div style={{ marginTop: 18 }}>
                      <b>Project Parameters:</b>
                      <pre
                        style={{
                          background: "#232B3A",
                          color: "#fff",
                          borderRadius: 8,
                          padding: "1rem",
                          fontSize: "0.95rem",
                          marginTop: 8,
                          overflowX: "auto",
                          maxHeight: 300,
                        }}
                      >
                        {JSON.stringify(projectDetails, null, 2)}
                      </pre>
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 28, justifyContent: "flex-end" }}>
                      <button
                        onClick={handleAssignAsCurrent}
                        style={{
                          background: "#3B82F6",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          padding: "0.7rem 1.2rem",
                          fontWeight: 500,
                          fontSize: "1rem",
                          cursor: "pointer",
                        }}
                      >
                        Assign as Current
                      </button>
                      <button
                        onClick={handleEditParameters}
                        style={{
                          background: "#A855F7",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          padding: "0.7rem 1.2rem",
                          fontWeight: 500,
                          fontSize: "1rem",
                          cursor: "pointer",
                        }}
                      >
                        Edit Parameters
                      </button>
                      <button
                        onClick={handleDeleteProject}
                        style={{
                          background: "#EF4444",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          padding: "0.7rem 1.2rem",
                          fontWeight: 500,
                          fontSize: "1rem",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectManagement;
