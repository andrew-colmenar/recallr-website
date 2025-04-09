import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { appApi } from "../../../api/axios";
import Cookies from "js-cookie";
import {
  AlertCircle,
  X,
  Check,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  Save,
  InfoIcon,
} from "lucide-react";
import styles from "./ProjectSettings.module.css";
import { useAuth } from "../../../context/AuthContext";

const ProjectSettings = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showSections, setShowSections] = useState({
    classifierInstructions: false,
    subqueryGenerator: false,
    generationPreferences: false,
  });
  const [editedProject, setEditedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { user } = useAuth();
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Fetch project data when component mounts or projectId changes
  useEffect(() => {
    const projectId = searchParams.get("project");
    const isNewUser = searchParams.get("newUser") === "true";

    // Clear any lingering UI states when project changes
    setShowDeleteConfirm(false);
    setDeleteConfirmText("");
    setSuccess(null);
    setError(null);
    setIsEditing(false);

    // For new users with no projects yet, show create project view
    if (isNewUser) {
      setLoading(false);
      setIsEditing(true); // Enable editing mode

      // Create a default project with ALL required fields
      const defaultProject = {
        id: "00000000-0000-0000-0000-000000000000", // Valid UUID format
        name: "My First Project",
        description: "",
        recall_preferences: {
          // Add the missing required fields
          return_min_top_k: 3, // Default sensible value
          return_max_top_k: 10, // Default sensible value
          threshold: 0.7, // Default sensible value

          classifier: {
            custom_instructions: [],
            false_positive_examples: [],
            false_negative_examples: [],
          },
          subquery_and_keywords_generator: {
            custom_instructions: [],
            subqueries_candidate_nodes_weight: 0,
            // Add the missing required fields
            subqueries_candidate_memories_weight: 0, // Default value
            example_subqueries: [],
            keywords_candidate_nodes_weight: 0,
            // Add the missing required fields
            keywords_candidate_memories_weight: 0, // Default value
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

      setProject(defaultProject);
      setEditedProject(JSON.parse(JSON.stringify(defaultProject))); // Deep clone

      // Add a welcome message
      setSuccess(
        "Welcome to Recallr AI! Create your first project to get started."
      );
      return;
    }

    if (!projectId) {
      setError(
        "No project selected. Please select a project from the dashboard."
      );
      setLoading(false);
      return;
    }

    fetchProject(projectId);
  }, [searchParams]);

  // Fetch project details from API
  const fetchProject = async (projectId) => {
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
      // console.log(response);
      setProject(response.data);
      setEditedProject(JSON.parse(JSON.stringify(response.data)));
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Project not found. It may have been deleted.");
      } else if (err.response?.status === 401) {
        setError("Authentication required. Please log in again.");
        // Potentially redirect to login page
      } else {
        setError("Failed to load project details. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Toggle accordion sections
  const toggleSection = (section) => {
    setShowSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;

    // For raise_merge_conflict in generation_preferences
    if (name === "raise_merge_conflict") {
      setEditedProject((prev) => ({
        ...prev,
        generation_preferences: {
          ...prev.generation_preferences,
          raise_merge_conflict: checked,
        },
      }));
      return;
    }
  };

  // Handle number input changes
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);

    if (name === "top_k_symantic_similarity_check") {
      setEditedProject((prev) => ({
        ...prev,
        generation_preferences: {
          ...prev.generation_preferences,
          top_k_symantic_similarity_check: numValue,
        },
      }));
    } else if (name === "subqueries_candidate_nodes_weight") {
      setEditedProject((prev) => ({
        ...prev,
        recall_preferences: {
          ...prev.recall_preferences,
          subquery_and_keywords_generator: {
            ...prev.recall_preferences.subquery_and_keywords_generator,
            subqueries_candidate_nodes_weight: numValue,
          },
        },
      }));
    } else if (name === "keywords_candidate_nodes_weight") {
      setEditedProject((prev) => ({
        ...prev,
        recall_preferences: {
          ...prev.recall_preferences,
          subquery_and_keywords_generator: {
            ...prev.recall_preferences.subquery_and_keywords_generator,
            keywords_candidate_nodes_weight: numValue,
          },
        },
      }));
    }
  };

  // Handle array item changes (instructions, examples)
  const handleArrayItemChange = (path, index, value) => {
    // pathParts will be something like ['recall_preferences', 'classifier', 'custom_instructions']
    const pathParts = path.split(".");

    setEditedProject((prev) => {
      const newProject = { ...prev };

      // Navigate to the correct nested property
      let current = newProject;
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }

      // Update the array item at the specific index
      const arrayName = pathParts[pathParts.length - 1];
      current[arrayName] = [...current[arrayName]];
      current[arrayName][index] = value;

      return newProject;
    });
  };

  // Add a new item to an array
  const addArrayItem = (path, defaultValue = "") => {
    // Prevent multiple rapid clicks from adding multiple items
    if (isAddingItem) return;

    setIsAddingItem(true);

    const pathParts = path.split(".");

    setEditedProject((prev) => {
      const newProject = JSON.parse(JSON.stringify(prev)); // Deep clone to avoid reference issues

      // Navigate to the correct nested property
      let current = newProject;
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
          console.error(`Path ${pathParts[i]} not found in project structure`);
          return prev; // Return previous state unchanged if path is invalid
        }
        current = current[pathParts[i]];
      }

      // Add a new item to the array
      const arrayName = pathParts[pathParts.length - 1];
      if (!Array.isArray(current[arrayName])) {
        console.error(`${arrayName} is not an array in project structure`);
        return prev; // Return previous state unchanged if target is not an array
      }

      current[arrayName] = [...current[arrayName], defaultValue];

      return newProject;
    });

    // Reset the flag after a short delay to prevent multiple rapid clicks
    setTimeout(() => {
      setIsAddingItem(false);
    }, 300);
  };

  // Remove an item from an array
  const removeArrayItem = (path, index) => {
    const pathParts = path.split(".");

    setEditedProject((prev) => {
      const newProject = { ...prev };

      // Navigate to the correct nested property
      let current = newProject;
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }

      // Remove the item from the array
      const arrayName = pathParts[pathParts.length - 1];
      current[arrayName] = current[arrayName].filter((_, i) => i !== index);

      return newProject;
    });
  };

  // Submit the updated project
  const handleUpdateProject = async () => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const user_id = Cookies.get("user_id");
      const session_id = Cookies.get("session_id");

      if (!user_id || !session_id) {
        throw new Error("Authentication required");
      }

      // Create update payload
      const updatePayload = {
        name: editedProject.name,
        description: editedProject.description,
        recall_preferences: editedProject.recall_preferences,
        generation_preferences: editedProject.generation_preferences,
      };

      // Log payload for debugging
      // console.log('Sending project payload:', JSON.stringify(updatePayload, null, 2));

      let response;

      // If this is a default/new project, create a new one instead of updating
      if (project.id === "00000000-0000-0000-0000-000000000000") {
        // Creating a new project
        try {
          response = await appApi.post("projects", updatePayload, {
            headers: {
              "X-User-Id": user_id,
              "X-Session-Id": session_id,
              "Content-Type": "application/json",
            },
          });

          // The response contains project_id, not the full project data
          const { project_id } = response.data;

          if (!project_id) {
            throw new Error("Project ID not received from server");
          }

          // Now fetch the full project details
          response = await appApi.get(`projects/${project_id}`, {
            headers: {
              "X-User-Id": user_id,
              "X-Session-Id": session_id,
            },
          });

          // Navigate to the newly created project
          navigate(`/dashboard/settings?project=${project_id}`, {
            replace: true,
          });

          setSuccess("Project created successfully!");
        } catch (err) {
          console.error("Project creation error:", err);

          // Handle validation errors more specifically
          if (err.response?.status === 422) {
            const validationErrors = err.response.data.detail;
            if (Array.isArray(validationErrors)) {
              const errorMessages = validationErrors
                .map((error) => `${error.loc.join(".")} - ${error.msg}`)
                .join("\n");
              setError(`Validation error: ${errorMessages}`);
            } else {
              setError(
                `Validation error: ${
                  err.response.data.detail || "Unknown validation error"
                }`
              );
            }
          } else {
            setError(
              err.response?.data?.detail ||
                err.message ||
                "Failed to create project"
            );
          }

          setActionLoading(false);
          return; // Exit early on error
        }
      } else {
        // Normal update for existing project
        response = await appApi.put(`projects/${project.id}`, updatePayload, {
          headers: {
            "X-User-Id": user_id,
            "X-Session-Id": session_id,
          },
        });

        setSuccess("Project updated successfully");
      }

      // Update the project state with the response data
      setProject(response.data);
      setEditedProject(JSON.parse(JSON.stringify(response.data))); // Deep clone

      setIsEditing(false);

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      console.error("Project update error:", err);

      if (err.response?.status === 404) {
        setError("Project not found. It may have been deleted.");
      } else if (err.response?.status === 401) {
        setError("Authentication required. Please log in again.");
      } else if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          const errorMessages = err.response.data.detail
            .map(
              (error) =>
                `${error.loc ? error.loc.join(".") : ""} - ${error.msg}`
            )
            .join("\n");
          setError(`Validation error: ${errorMessages}`);
        } else {
          setError(err.response.data.detail || "Failed to update project");
        }
      } else {
        setError("Failed to update project. Please try again.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Delete the project
  const handleDeleteProject = async () => {
    if (deleteConfirmText !== project.name) {
      setError("Please type the project name correctly to confirm deletion.");
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const user_id = Cookies.get("user_id");
      const session_id = Cookies.get("session_id");

      if (!user_id || !session_id) {
        throw new Error("Authentication required");
      }

      // Step 1: Fetch all projects first to determine where to redirect later
      const projectsResponse = await appApi.get("projects", {
        headers: {
          "X-User-Id": user_id,
          "X-Session-Id": session_id,
        },
        params: {
          offset: 0,
          limit: 100,
        },
      });

      const allProjects = projectsResponse.data.projects || [];

      // Filter out the current project that's going to be deleted
      const otherProjects = allProjects.filter((p) => p.id !== project.id);

      // Step 2: Delete the current project
      await appApi.delete(`projects/${project.id}`, {
        headers: {
          "X-User-Id": user_id,
          "X-Session-Id": session_id,
        },
      });

      setSuccess("Project deleted successfully. Redirecting...");

      // Step 3: Immediately navigate to the next project without waiting
      // Using replace: true to replace the current history entry
      if (otherProjects.length > 0) {
        // Sort by created_at descending to get the newest project
        const sortedProjects = [...otherProjects].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        // Immediately navigate with replace
        navigate(`/dashboard/settings?project=${sortedProjects[0].id}`, {
          replace: true,
        });
      } else {
        // If no projects left, redirect to dashboard without project param
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Project not found. It may have been already deleted.");
      } else if (err.response?.status === 401) {
        setError("Authentication required. Please log in again.");
      } else if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          setError(
            err.response.data.detail[0]?.msg || "Failed to delete project"
          );
        } else {
          setError(err.response.data.detail || "Failed to delete project");
        }
      } else {
        setError("Failed to delete project. Please try again.");
      }

      setShowDeleteConfirm(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditedProject(JSON.parse(JSON.stringify(project))); // Reset to original
    setIsEditing(false);
    setError(null);
  };

  if (loading) {
    return <div className={styles.loading}>Loading project settings...</div>;
  }

  if (!project || !editedProject) {
    return (
      <div className={styles.error}>
        <AlertCircle size={24} />
        <h2>Project not found</h2>
        <p>
          {error ||
            "We couldn't find this project. Please return to the dashboard."}
        </p>
        <button
          className={styles.returnButton}
          onClick={() => navigate("/dashboard")}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header with Project Name and Edit/Save buttons */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={editedProject.name}
                onChange={handleInputChange}
                className={styles.editableTitle}
              />
            ) : (
              project.name
            )}
          </h1>

          <div className={styles.actionButtons}>
            {isEditing ? (
              <>
                <button
                  className={`${styles.actionButton} ${styles.cancelButton}`}
                  onClick={handleCancelEdit}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  className={`${styles.actionButton} ${styles.saveButton}`}
                  onClick={handleUpdateProject}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Saving..." : "Save Changes"}
                  {!actionLoading && <Save size={16} />}
                </button>
              </>
            ) : (
              <button
                className={`${styles.actionButton} ${styles.editButton}`}
                onClick={() => setIsEditing(true)}
              >
                Edit Project
                <Edit size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className={styles.errorMessage}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className={styles.successMessage}>
            <Check size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Project Info Section */}
        <section className={styles.infoSection}>
          <h2 className={styles.sectionTitle}>Project Information</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Project ID</div>
              <div className={styles.infoValue}>{project.id}</div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Created At</div>
              <div className={styles.infoValue}>
                {formatDate(project.created_at)}
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Description</div>
              {isEditing ? (
                <textarea
                  name="description"
                  value={editedProject.description || ""}
                  onChange={handleInputChange}
                  className={styles.editableDescription}
                  placeholder="Enter project description"
                />
              ) : (
                <div className={styles.infoValue}>
                  {project.description || "No description provided"}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Preferences Sections */}
        <section className={styles.preferencesSection}>
          <h2 className={styles.sectionTitle}>Project Preferences</h2>

          {/* Classifier Instructions */}
          <div className={styles.preferencesCard}>
            <div
              className={styles.cardHeader}
              onClick={() => toggleSection("classifierInstructions")}
            >
              <h3 className={styles.cardTitle}>Classifier Preferences</h3>
              <button className={styles.toggleButton}>
                {showSections.classifierInstructions ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
            </div>

            {showSections.classifierInstructions && (
              <div className={styles.cardContent}>
                {/* Custom Instructions */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Custom Instructions
                  </label>
                  {editedProject.recall_preferences.classifier
                    .custom_instructions.length > 0 ? (
                    editedProject.recall_preferences.classifier.custom_instructions.map(
                      (instruction, index) => (
                        <div
                          key={`instruction-${index}`}
                          className={styles.arrayItemContainer}
                        >
                          {isEditing ? (
                            <>
                              <textarea
                                value={instruction}
                                onChange={(e) =>
                                  handleArrayItemChange(
                                    "recall_preferences.classifier.custom_instructions",
                                    index,
                                    e.target.value
                                  )
                                }
                                className={styles.arrayItemInput}
                              />
                              <button
                                className={styles.removeItemButton}
                                onClick={() =>
                                  removeArrayItem(
                                    "recall_preferences.classifier.custom_instructions",
                                    index
                                  )
                                }
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <div className={styles.arrayItemValue}>
                              {instruction || "No instruction provided"}
                            </div>
                          )}
                        </div>
                      )
                    )
                  ) : (
                    <div className={styles.emptyState}>
                      <InfoIcon size={18} />
                      <p>
                        No custom instructions have been added yet.{" "}
                        {isEditing && "Use the button below to add some."}
                      </p>
                    </div>
                  )}
                  {isEditing && (
                    <button
                      className={styles.addItemButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        addArrayItem(
                          "recall_preferences.classifier.custom_instructions"
                        );
                      }}
                    >
                      <Plus size={16} />
                      <span>Add Custom Instruction</span>
                    </button>
                  )}
                </div>

                {/* False Positive Examples */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    False Positive Examples
                  </label>
                  {editedProject.recall_preferences.classifier
                    .false_positive_examples.length > 0 ? (
                    editedProject.recall_preferences.classifier.false_positive_examples.map(
                      (example, index) => (
                        <div
                          key={`fp-${index}`}
                          className={styles.arrayItemContainer}
                        >
                          {isEditing ? (
                            <>
                              <textarea
                                value={example}
                                onChange={(e) =>
                                  handleArrayItemChange(
                                    "recall_preferences.classifier.false_positive_examples",
                                    index,
                                    e.target.value
                                  )
                                }
                                className={styles.arrayItemInput}
                              />
                              <button
                                className={styles.removeItemButton}
                                onClick={() =>
                                  removeArrayItem(
                                    "recall_preferences.classifier.false_positive_examples",
                                    index
                                  )
                                }
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <div className={styles.arrayItemValue}>
                              {example || "No example provided"}
                            </div>
                          )}
                        </div>
                      )
                    )
                  ) : (
                    <div className={styles.emptyState}>
                      <InfoIcon size={18} />
                      <p>
                        No false positive examples have been added yet.{" "}
                        {isEditing && "Use the button below to add some."}
                      </p>
                    </div>
                  )}
                  {isEditing && (
                    <button
                      className={styles.addItemButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        addArrayItem(
                          "recall_preferences.classifier.false_positive_examples"
                        );
                      }}
                    >
                      <Plus size={16} />
                      <span>Add False Positive Example</span>
                    </button>
                  )}
                </div>

                {/* False Negative Examples */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    False Negative Examples
                  </label>
                  {editedProject.recall_preferences.classifier
                    .false_negative_examples.length > 0 ? (
                    editedProject.recall_preferences.classifier.false_negative_examples.map(
                      (example, index) => (
                        <div
                          key={`fn-${index}`}
                          className={styles.arrayItemContainer}
                        >
                          {isEditing ? (
                            <>
                              <textarea
                                value={example}
                                onChange={(e) =>
                                  handleArrayItemChange(
                                    "recall_preferences.classifier.false_negative_examples",
                                    index,
                                    e.target.value
                                  )
                                }
                                className={styles.arrayItemInput}
                              />
                              <button
                                className={styles.removeItemButton}
                                onClick={() =>
                                  removeArrayItem(
                                    "recall_preferences.classifier.false_negative_examples",
                                    index
                                  )
                                }
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <div className={styles.arrayItemValue}>
                              {example || "No example provided"}
                            </div>
                          )}
                        </div>
                      )
                    )
                  ) : (
                    <div className={styles.emptyState}>
                      <InfoIcon size={18} />
                      <p>
                        No false negative examples have been added yet.{" "}
                        {isEditing && "Use the button below to add some."}
                      </p>
                    </div>
                  )}
                  {isEditing && (
                    <button
                      className={styles.addItemButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        addArrayItem(
                          "recall_preferences.classifier.false_negative_examples"
                        );
                      }}
                    >
                      <Plus size={16} />
                      <span>Add False Negative Example</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Subquery and Keywords Generator */}
          <div className={styles.preferencesCard}>
            <div
              className={styles.cardHeader}
              onClick={() => toggleSection("subqueryGenerator")}
            >
              <h3 className={styles.cardTitle}>
                Subquery & Keywords Generator
              </h3>
              <button className={styles.toggleButton}>
                {showSections.subqueryGenerator ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
            </div>

            {showSections.subqueryGenerator && (
              <div className={styles.cardContent}>
                {/* Custom Instructions */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Custom Instructions
                  </label>
                  {editedProject.recall_preferences
                    .subquery_and_keywords_generator.custom_instructions
                    .length > 0 ? (
                    editedProject.recall_preferences.subquery_and_keywords_generator.custom_instructions.map(
                      (instruction, index) => (
                        <div
                          key={`subq-inst-${index}`}
                          className={styles.arrayItemContainer}
                        >
                          {isEditing ? (
                            <>
                              <textarea
                                value={instruction}
                                onChange={(e) =>
                                  handleArrayItemChange(
                                    "recall_preferences.subquery_and_keywords_generator.custom_instructions",
                                    index,
                                    e.target.value
                                  )
                                }
                                className={styles.arrayItemInput}
                              />
                              <button
                                className={styles.removeItemButton}
                                onClick={() =>
                                  removeArrayItem(
                                    "recall_preferences.subquery_and_keywords_generator.custom_instructions",
                                    index
                                  )
                                }
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <div className={styles.arrayItemValue}>
                              {instruction || "No instruction provided"}
                            </div>
                          )}
                        </div>
                      )
                    )
                  ) : (
                    <div className={styles.emptyState}>
                      <InfoIcon size={18} />
                      <p>
                        No custom instructions have been added yet.{" "}
                        {isEditing && "Use the button below to add some."}
                      </p>
                    </div>
                  )}
                  {isEditing && (
                    <button
                      className={styles.addItemButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        addArrayItem(
                          "recall_preferences.subquery_and_keywords_generator.custom_instructions"
                        );
                      }}
                    >
                      <Plus size={16} />
                      <span>Add Custom Instruction</span>
                    </button>
                  )}
                </div>

                {/* Subqueries Weight */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Subqueries Candidate Nodes Weight
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="subqueries_candidate_nodes_weight"
                      value={
                        editedProject.recall_preferences
                          .subquery_and_keywords_generator
                          .subqueries_candidate_nodes_weight
                      }
                      onChange={handleNumberChange}
                      step="0.1"
                      className={styles.numberInput}
                    />
                  ) : (
                    <div className={styles.infoValue}>
                      {
                        editedProject.recall_preferences
                          .subquery_and_keywords_generator
                          .subqueries_candidate_nodes_weight
                      }
                    </div>
                  )}
                </div>

                {/* Example Subqueries */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Example Subqueries
                  </label>
                  {editedProject.recall_preferences
                    .subquery_and_keywords_generator.example_subqueries.length >
                  0 ? (
                    editedProject.recall_preferences.subquery_and_keywords_generator.example_subqueries.map(
                      (example, index) => (
                        <div
                          key={`subq-${index}`}
                          className={styles.arrayItemContainer}
                        >
                          {isEditing ? (
                            <>
                              <input
                                type="text"
                                value={example}
                                onChange={(e) =>
                                  handleArrayItemChange(
                                    "recall_preferences.subquery_and_keywords_generator.example_subqueries",
                                    index,
                                    e.target.value
                                  )
                                }
                                className={styles.arrayItemInput}
                              />
                              <button
                                className={styles.removeItemButton}
                                onClick={() =>
                                  removeArrayItem(
                                    "recall_preferences.subquery_and_keywords_generator.example_subqueries",
                                    index
                                  )
                                }
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <div className={styles.arrayItemValue}>
                              {example || "No example provided"}
                            </div>
                          )}
                        </div>
                      )
                    )
                  ) : (
                    <div className={styles.emptyState}>
                      <InfoIcon size={18} />
                      <p>
                        No example subqueries have been added yet.{" "}
                        {isEditing && "Use the button below to add some."}
                      </p>
                    </div>
                  )}
                  {isEditing && (
                    <button
                      className={styles.addItemButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        addArrayItem(
                          "recall_preferences.subquery_and_keywords_generator.example_subqueries"
                        );
                      }}
                    >
                      <Plus size={16} />
                      <span>Add Example Subquery</span>
                    </button>
                  )}
                </div>

                {/* Keywords Weight */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Keywords Candidate Nodes Weight
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="keywords_candidate_nodes_weight"
                      value={
                        editedProject.recall_preferences
                          .subquery_and_keywords_generator
                          .keywords_candidate_nodes_weight
                      }
                      onChange={handleNumberChange}
                      step="0.1"
                      className={styles.numberInput}
                    />
                  ) : (
                    <div className={styles.infoValue}>
                      {
                        editedProject.recall_preferences
                          .subquery_and_keywords_generator
                          .keywords_candidate_nodes_weight
                      }
                    </div>
                  )}
                </div>

                {/* Example Keywords */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Example Keywords</label>
                  {editedProject.recall_preferences
                    .subquery_and_keywords_generator.example_keywords.length >
                  0 ? (
                    editedProject.recall_preferences.subquery_and_keywords_generator.example_keywords.map(
                      (keyword, index) => (
                        <div
                          key={`keyword-${index}`}
                          className={styles.arrayItemContainer}
                        >
                          {isEditing ? (
                            <>
                              <input
                                type="text"
                                value={keyword}
                                onChange={(e) =>
                                  handleArrayItemChange(
                                    "recall_preferences.subquery_and_keywords_generator.example_keywords",
                                    index,
                                    e.target.value
                                  )
                                }
                                className={styles.arrayItemInput}
                              />
                              <button
                                className={styles.removeItemButton}
                                onClick={() =>
                                  removeArrayItem(
                                    "recall_preferences.subquery_and_keywords_generator.example_keywords",
                                    index
                                  )
                                }
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <div className={styles.arrayItemValue}>
                              {keyword || "No keyword provided"}
                            </div>
                          )}
                        </div>
                      )
                    )
                  ) : (
                    <div className={styles.emptyState}>
                      <InfoIcon size={18} />
                      <p>
                        No example keywords have been added yet.{" "}
                        {isEditing && "Use the button below to add some."}
                      </p>
                    </div>
                  )}
                  {isEditing && (
                    <button
                      className={styles.addItemButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        addArrayItem(
                          "recall_preferences.subquery_and_keywords_generator.example_keywords"
                        );
                      }}
                    >
                      <Plus size={16} />
                      <span>Add Example Keyword</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Generation Preferences */}
          <div className={styles.preferencesCard}>
            <div
              className={styles.cardHeader}
              onClick={() => toggleSection("generationPreferences")}
            >
              <h3 className={styles.cardTitle}>Generation Preferences</h3>
              <button className={styles.toggleButton}>
                {showSections.generationPreferences ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
            </div>

            {showSections.generationPreferences && (
              <div className={styles.cardContent}>
                {/* Custom Instructions */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Custom Instructions
                  </label>
                  {editedProject.generation_preferences.custom_instructions
                    .length > 0 ? (
                    editedProject.generation_preferences.custom_instructions.map(
                      (instruction, index) => (
                        <div
                          key={`gen-inst-${index}`}
                          className={styles.arrayItemContainer}
                        >
                          {isEditing ? (
                            <>
                              <textarea
                                value={instruction}
                                onChange={(e) =>
                                  handleArrayItemChange(
                                    "generation_preferences.custom_instructions",
                                    index,
                                    e.target.value
                                  )
                                }
                                className={styles.arrayItemInput}
                              />
                              <button
                                className={styles.removeItemButton}
                                onClick={() =>
                                  removeArrayItem(
                                    "generation_preferences.custom_instructions",
                                    index
                                  )
                                }
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <div className={styles.arrayItemValue}>
                              {instruction || "No instruction provided"}
                            </div>
                          )}
                        </div>
                      )
                    )
                  ) : (
                    <div className={styles.emptyState}>
                      <InfoIcon size={18} />
                      <p>
                        No custom instructions have been added yet.{" "}
                        {isEditing && "Use the button below to add some."}
                      </p>
                    </div>
                  )}
                  {isEditing && (
                    <button
                      className={styles.addItemButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        addArrayItem(
                          "generation_preferences.custom_instructions"
                        );
                      }}
                    >
                      <Plus size={16} />
                      <span>Add Custom Instruction</span>
                    </button>
                  )}
                </div>

                {/* Top K Semantic Similarity Check */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Top K Semantic Similarity Check
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="top_k_symantic_similarity_check"
                      value={
                        editedProject.generation_preferences
                          .top_k_symantic_similarity_check
                      }
                      onChange={handleNumberChange}
                      min="0"
                      step="1"
                      className={styles.numberInput}
                    />
                  ) : (
                    <div className={styles.infoValue}>
                      {
                        editedProject.generation_preferences
                          .top_k_symantic_similarity_check
                      }
                    </div>
                  )}
                </div>

                {/* Raise Merge Conflict */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Raise Merge Conflict
                  </label>
                  {isEditing ? (
                    <div className={styles.switchContainer}>
                      <input
                        type="checkbox"
                        id="raiseMergeConflict"
                        name="raise_merge_conflict"
                        checked={
                          editedProject.generation_preferences
                            .raise_merge_conflict
                        }
                        onChange={handleCheckboxChange}
                        className={styles.switchInput}
                      />
                      <label
                        htmlFor="raiseMergeConflict"
                        className={styles.switchLabel}
                      >
                        {editedProject.generation_preferences
                          .raise_merge_conflict
                          ? "Enabled"
                          : "Disabled"}
                      </label>
                    </div>
                  ) : (
                    <div className={styles.infoValue}>
                      {editedProject.generation_preferences.raise_merge_conflict
                        ? "Enabled"
                        : "Disabled"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Danger Zone */}
        <section className={styles.dangerZone}>
          <h2 className={styles.dangerTitle}>Danger Zone</h2>

          <div className={styles.dangerCard}>
            <div className={styles.dangerInfo}>
              <h3>Delete this project</h3>
              <p>
                Once you delete a project, there is no going back. Please be
                certain.
              </p>
            </div>

            <button
              className={styles.deleteButton}
              onClick={() => setShowDeleteConfirm(true)}
              disabled={actionLoading}
            >
              Delete Project
            </button>
          </div>
        </section>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className={styles.modalOverlay}>
            <div className={styles.deleteModal}>
              <div className={styles.modalHeader}>
                <h3>Delete Project</h3>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.warningMessage}>
                  <AlertCircle size={20} />
                  <span>
                    This action cannot be undone. This will permanently delete
                    the project.
                  </span>
                </div>

                <p>
                  Please type <strong>{project.name}</strong> to confirm.
                </p>

                <input
                  type="text"
                  className={styles.confirmInput}
                  placeholder="Type project name to confirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                />

                <div className={styles.modalActions}>
                  <button
                    className={styles.cancelButton}
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>

                  <button
                    className={styles.deleteConfirmButton}
                    onClick={handleDeleteProject}
                    disabled={
                      actionLoading || deleteConfirmText !== project.name
                    }
                  >
                    {actionLoading
                      ? "Deleting..."
                      : "I understand, delete this project"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSettings;
