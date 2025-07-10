import React, { useState, useEffect } from "react";
import { useProjectContext } from "../../../context/ProjectContext";
import { appApi } from "../../../api/axios";
import Cookies from "js-cookie";
import { useSearchParams } from "react-router-dom";
import { Info, Settings, Save, ChevronDown, ChevronRight, Plus, X } from "lucide-react";
import styles from "./ProjectSettings.module.css";

const FIELD_INFO = {
  return_min_top_k: "Minimum number of top results to return for recall queries. Must be between 1 and 10.",
  return_max_top_k: "Maximum number of top results to return for recall queries. Must be between 1 and 10.",
  threshold: "Similarity threshold for considering a result relevant (0-1). Higher values mean stricter matching.",
  top_k_symantic_similarity_check: "Number of top results to check for semantic similarity. Must be between 1 and 10.",
  raise_merge_conflict: "If enabled, merge conflicts will be raised during generation. Recommended for advanced users.",
  'recall_preferences.classifier.custom_instructions': "Custom instructions for the classifier module. Used to fine-tune classification behavior.",
  'recall_preferences.classifier.false_positive_examples': "Examples that should NOT be classified as relevant (false positives).",
  'recall_preferences.classifier.false_negative_examples': "Examples that SHOULD be classified as relevant (false negatives).",
  'recall_preferences.subquery_and_keywords_generator.custom_instructions': "Custom instructions for the subquery and keywords generator.",
  'recall_preferences.subquery_and_keywords_generator.subqueries_candidate_nodes_weight': "Weight for subqueries candidate nodes (0-1).",
  'recall_preferences.subquery_and_keywords_generator.subqueries_candidate_memories_weight': "Weight for subqueries candidate memories (0-1).",
  'recall_preferences.subquery_and_keywords_generator.example_subqueries': "Example subqueries for the generator.",
  'recall_preferences.subquery_and_keywords_generator.keywords_candidate_nodes_weight': "Weight for keywords candidate nodes (0-1).",
  'recall_preferences.subquery_and_keywords_generator.keywords_candidate_memories_weight': "Weight for keywords candidate memories (0-1).",
  'recall_preferences.subquery_and_keywords_generator.example_keywords': "Example keywords for the generator.",
  'generation_preferences.custom_instructions': "Custom instructions for the generation module.",
};

function InfoTooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span className={styles.tooltipContainer}>
      <Info 
        size={16} 
        className={styles.tooltipIcon}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        tabIndex={0}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
      />
      {show && (
        <span className={styles.tooltipContent}>{text}</span>
      )}
    </span>
  );
}

// Helper: get default for a field
const getDefaultForField = (field) => {
  switch (field) {
    case "return_min_top_k":
    case "return_max_top_k":
    case "top_k_symantic_similarity_check":
      return 1;
    case "threshold":
      return 0.7;
    case "subqueries_candidate_nodes_weight":
    case "subqueries_candidate_memories_weight":
    case "keywords_candidate_nodes_weight":
    case "keywords_candidate_memories_weight":
      return 0.5;
    default:
      return "";
  }
};

// Helper: validate field value
const validateField = (field, value, form) => {
  switch (field) {
    case "return_min_top_k":
      if (value < 1 || value > 10) return "Must be between 1 and 10";
      if (form.recall_preferences?.return_max_top_k && value > form.recall_preferences.return_max_top_k) {
        return "Must be less than or equal to Max Top K";
      }
      return null;
    case "return_max_top_k":
      if (value < 1 || value > 10) return "Must be between 1 and 10";
      if (form.recall_preferences?.return_min_top_k && value < form.recall_preferences.return_min_top_k) {
        return "Must be greater than or equal to Min Top K";
      }
      return null;
    case "threshold":
      if (value < 0 || value > 1) return "Must be between 0 and 1";
      return null;
    case "top_k_symantic_similarity_check":
      if (value < 1 || value > 10) return "Must be between 1 and 10";
      return null;
    case "subqueries_candidate_nodes_weight":
    case "subqueries_candidate_memories_weight":
    case "keywords_candidate_nodes_weight":
    case "keywords_candidate_memories_weight":
      if (value < 0 || value > 1) return "Must be between 0 and 1";
      return null;
    default:
      return null;
  }
};

const ProjectSettings = () => {
  const { currentProject, setCurrentProject } = useProjectContext();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchParams] = useSearchParams();
  const [showAdvancedRecall, setShowAdvancedRecall] = useState(false);
  const [showAdvancedGeneration, setShowAdvancedGeneration] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Initialize form with defaults if needed
  const initializeFormWithDefaults = (project) => {
    const initialized = JSON.parse(JSON.stringify(project));

    // Initialize recall_preferences with defaults
    if (!initialized.recall_preferences) {
      initialized.recall_preferences = {};
    }
    
    // Set defaults for basic recall fields
    if (!initialized.recall_preferences.return_min_top_k) {
      initialized.recall_preferences.return_min_top_k = 1;
    }
    if (!initialized.recall_preferences.return_max_top_k) {
      initialized.recall_preferences.return_max_top_k = 5;
    }
    if (!initialized.recall_preferences.threshold) {
      initialized.recall_preferences.threshold = 0.7;
    }
    
    // Initialize classifier with defaults
    if (!initialized.recall_preferences.classifier) {
      initialized.recall_preferences.classifier = {
        custom_instructions: "",
            false_positive_examples: [],
        false_negative_examples: []
      };
    }
    
    // Initialize subquery_and_keywords_generator with defaults
    if (!initialized.recall_preferences.subquery_and_keywords_generator) {
      initialized.recall_preferences.subquery_and_keywords_generator = {
        custom_instructions: "",
        subqueries_candidate_nodes_weight: 0.5,
        subqueries_candidate_memories_weight: 0.5,
            example_subqueries: [],
        keywords_candidate_nodes_weight: 0.5,
        keywords_candidate_memories_weight: 0.5,
        example_keywords: []
      };
    }
    
    // Initialize generation_preferences with defaults
    if (!initialized.generation_preferences) {
      initialized.generation_preferences = {
        top_k_symantic_similarity_check: 1,
          raise_merge_conflict: false,
        custom_instructions: ""
      };
    }
    
    return initialized;
  };

  // Fetch project if query param is present and context is missing or mismatched
  useEffect(() => {
    const projectId = searchParams.get("project");
    if (!projectId) return;
    
    if (!currentProject || currentProject.id !== projectId) {
    setLoading(true);
    setError(null);
      const user_id = Cookies.get("user_id");
      const session_id = Cookies.get("session_id");
      if (!user_id || !session_id) {
        setError("Authentication required");
        setLoading(false);
        return;
      }
      appApi.get(`projects/${projectId}`, {
        headers: {
          "X-User-Id": user_id,
          "X-Session-Id": session_id,
        },
      })
        .then((response) => {
          const initializedProject = initializeFormWithDefaults(response.data);
          setCurrentProject(initializedProject);
          setForm(initializedProject);
        })
        .catch((err) => {
          setError(err.response?.data?.detail || err.message || "Failed to load project.");
        })
        .finally(() => setLoading(false));
      } else {
      const initializedProject = initializeFormWithDefaults(currentProject);
      setForm(initializedProject);
    }
  }, [searchParams, currentProject, setCurrentProject]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading project settings...</p>
      </div>
    );
  }
  
  if (!form) {
    return (
      <div className={styles.errorContainer}>
        <h2>No Project Selected</h2>
        <p>Please select a project to view and edit its settings.</p>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    
    // Clear validation error for this field
    setValidationErrors(prev => ({ ...prev, [name]: null }));
  };

  // For nested fields (recall_preferences, generation_preferences)
  const handleNestedChange = (section, field, value) => {
    setForm((prev) => ({
        ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
        },
      }));
    
    // Clear validation error for this field
    setValidationErrors(prev => ({ ...prev, [`${section}.${field}`]: null }));
  };

  // For advanced array fields
  const handleAdvancedArrayChange = (section, subsection, field, idx, value) => {
    setForm((prev) => {
      const updated = { ...prev };
      if (!updated[section]) updated[section] = {};
      if (!updated[section][subsection]) updated[section][subsection] = {};
      if (!Array.isArray(updated[section][subsection][field])) {
        updated[section][subsection][field] = [];
      }
      updated[section][subsection][field][idx] = value;
      return updated;
    });
  };

  // For advanced array fields, ensure array is initialized before push
  const handleAdvancedArrayAdd = (section, subsection, field) => {
    setForm((prev) => {
      const updated = { ...prev };
      if (!updated[section]) updated[section] = {};
      if (!updated[section][subsection]) updated[section][subsection] = {};
      if (!Array.isArray(updated[section][subsection][field])) {
        updated[section][subsection][field] = [];
      }
      updated[section][subsection][field].push("");
      return updated;
    });
  };

  const handleAdvancedArrayRemove = (section, subsection, field, idx) => {
    setForm((prev) => {
      const updated = { ...prev };
      updated[section][subsection][field].splice(idx, 1);
      return updated;
    });
  };

  // Handle number input blur with validation and defaults
  const handleNumberBlur = (section, field, value) => {
    const numValue = Number(value);
    let finalValue = numValue;
    
    // If empty or invalid, set to default
    if (value === "" || isNaN(numValue)) {
      finalValue = getDefaultForField(field);
      }

    // Validate the value
    const validationError = validateField(field, finalValue, form);
    if (validationError) {
      setValidationErrors(prev => ({ ...prev, [`${section}.${field}`]: validationError }));
      return;
    }
    
    // Update the form
    handleNestedChange(section, field, finalValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submitting
    const errors = {};

    // Validate recall preferences
    if (form.recall_preferences) {
      const minTopK = form.recall_preferences.return_min_top_k;
      const maxTopK = form.recall_preferences.return_max_top_k;
      const threshold = form.recall_preferences.threshold;
      
      if (minTopK < 1 || minTopK > 10) {
        errors['recall_preferences.return_min_top_k'] = "Must be between 1 and 10";
            }
      if (maxTopK < 1 || maxTopK > 10) {
        errors['recall_preferences.return_max_top_k'] = "Must be between 1 and 10";
      }
      if (minTopK > maxTopK) {
        errors['recall_preferences.return_min_top_k'] = "Must be less than or equal to Max Top K";
        errors['recall_preferences.return_max_top_k'] = "Must be greater than or equal to Min Top K";
      }
      if (threshold < 0 || threshold > 1) {
        errors['recall_preferences.threshold'] = "Must be between 0 and 1";
      }
    }
    
    // Validate generation preferences
    if (form.generation_preferences) {
      const topK = form.generation_preferences.top_k_symantic_similarity_check;
      if (topK < 1 || topK > 10) {
        errors['generation_preferences.top_k_symantic_similarity_check'] = "Must be between 1 and 10";
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const user_id = Cookies.get("user_id");
      const session_id = Cookies.get("session_id");
      if (!user_id || !session_id) throw new Error("Authentication required");
      
      const payload = {
        name: form.name,
        description: form.description,
        recall_preferences: form.recall_preferences,
        generation_preferences: form.generation_preferences,
      };
      
      const response = await appApi.put(`projects/${form.id}`, payload, {
        headers: {
          "X-User-Id": user_id,
          "X-Session-Id": session_id,
        },
      });
      
      setCurrentProject(response.data);
      setSuccess("Project updated successfully.");
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to update project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <Settings size={24} />
            </div>
            <div>
              <h1 className={styles.title}>Project Settings</h1>
              <p className={styles.subtitle}>Configure your project's recall and generation preferences</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}
        {success && (
          <div className={styles.successMessage}>
            <span className={styles.successIcon}>✓</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Basic Project Info */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Basic Information</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Project Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name || ""}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                  placeholder="Enter project name"
                />
            </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={form.description || ""}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  rows={3}
                  placeholder="Describe your project"
                />
                </div>
            </div>
          </div>

          {/* Recall Preferences */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recall Preferences</h2>
              <p className={styles.sectionDescription}>
                Configure how the system retrieves and ranks relevant information
              </p>
            </div>

          <div className={styles.preferencesCard}>
              <div className={styles.cardContent}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Return Min Top K
                      <InfoTooltip text={FIELD_INFO.return_min_top_k} />
                    </label>
                    <input
                      type="number"
                      value={form.recall_preferences?.return_min_top_k || ""}
                      onChange={e => handleNestedChange("recall_preferences", "return_min_top_k", Number(e.target.value))}
                      onBlur={e => handleNumberBlur("recall_preferences", "return_min_top_k", e.target.value)}
                      className={`${styles.numberInput} ${validationErrors['recall_preferences.return_min_top_k'] ? styles.inputError : ''}`}
                      min="1"
                      max="10"
                      placeholder="Min Top K (1-10)"
                    />
                    {validationErrors['recall_preferences.return_min_top_k'] && (
                      <span className={styles.errorText}>{validationErrors['recall_preferences.return_min_top_k']}</span>
                )}
            </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Return Max Top K
                      <InfoTooltip text={FIELD_INFO.return_max_top_k} />
                  </label>
                    <input
                      type="number"
                      value={form.recall_preferences?.return_max_top_k || ""}
                      onChange={e => handleNestedChange("recall_preferences", "return_max_top_k", Number(e.target.value))}
                      onBlur={e => handleNumberBlur("recall_preferences", "return_max_top_k", e.target.value)}
                      className={`${styles.numberInput} ${validationErrors['recall_preferences.return_max_top_k'] ? styles.inputError : ''}`}
                      min="1"
                      max="10"
                      placeholder="Max Top K (1-10)"
                    />
                    {validationErrors['recall_preferences.return_max_top_k'] && (
                      <span className={styles.errorText}>{validationErrors['recall_preferences.return_max_top_k']}</span>
                    )}
                            </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Threshold
                      <InfoTooltip text={FIELD_INFO.threshold} />
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={form.recall_preferences?.threshold || ""}
                      onChange={e => handleNestedChange("recall_preferences", "threshold", Number(e.target.value))}
                      onBlur={e => handleNumberBlur("recall_preferences", "threshold", e.target.value)}
                      className={`${styles.numberInput} ${validationErrors['recall_preferences.threshold'] ? styles.inputError : ''}`}
                      placeholder="Threshold (0-1)"
                    />
                    {validationErrors['recall_preferences.threshold'] && (
                      <span className={styles.errorText}>{validationErrors['recall_preferences.threshold']}</span>
                          )}
                        </div>
                    </div>

                {/* Advanced Recall Preferences */}
                <div className={styles.advancedSection}>
                    <button
                    type="button"
                    onClick={() => setShowAdvancedRecall(!showAdvancedRecall)}
                    className={styles.advancedToggle}
                  >
                    {showAdvancedRecall ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    <span>Advanced Recall Settings</span>
                    </button>
                  
                  {showAdvancedRecall && (
                    <div className={styles.advancedContent}>
                      {/* Classifier Settings */}
                      <div className={styles.advancedSubsection}>
                        <h3 className={styles.subsectionTitle}>Classifier Settings</h3>
                        
                        <div className={styles.formGroup}>
                          <label className={styles.advancedLabel}>
                            Custom Instructions
                            <InfoTooltip text={FIELD_INFO['recall_preferences.classifier.custom_instructions']} />
                          </label>
                          <textarea
                            value={form.recall_preferences?.classifier?.custom_instructions || ""}
                            onChange={e => handleNestedChange("recall_preferences", "classifier", {
                              ...form.recall_preferences?.classifier,
                              custom_instructions: e.target.value
                            })}
                            className={styles.textarea}
                            rows={3}
                            placeholder="Enter custom instructions for the classifier"
                          />
                </div>

                        <div className={styles.formGroup}>
                          <label className={styles.advancedLabel}>
                    False Positive Examples
                            <InfoTooltip text={FIELD_INFO['recall_preferences.classifier.false_positive_examples']} />
                  </label>
                          <div className={styles.arrayContainer}>
                            {(form.recall_preferences?.classifier?.false_positive_examples || []).map((item, idx) => (
                              <div key={idx} className={styles.arrayItem}>
                                <input
                                  type="text"
                                  value={item}
                                  onChange={e => handleAdvancedArrayChange("recall_preferences", "classifier", "false_positive_examples", idx, e.target.value)}
                                  className={styles.arrayInput}
                                  placeholder="Enter false positive example"
                              />
                              <button
                                  type="button" 
                                  onClick={() => handleAdvancedArrayRemove("recall_preferences", "classifier", "false_positive_examples", idx)}
                                  className={styles.removeButton}
                              >
                                <X size={16} />
                              </button>
                            </div>
                            ))}
                    <button
                              type="button" 
                              onClick={() => handleAdvancedArrayAdd("recall_preferences", "classifier", "false_positive_examples")}
                              className={styles.addButton}
                    >
                      <Plus size={16} />
                              Add False Positive Example
                    </button>
                          </div>
                </div>

                        <div className={styles.formGroup}>
                          <label className={styles.advancedLabel}>
                    False Negative Examples
                            <InfoTooltip text={FIELD_INFO['recall_preferences.classifier.false_negative_examples']} />
                  </label>
                          <div className={styles.arrayContainer}>
                            {(form.recall_preferences?.classifier?.false_negative_examples || []).map((item, idx) => (
                              <div key={idx} className={styles.arrayItem}>
                                <input
                                  type="text"
                                  value={item}
                                  onChange={e => handleAdvancedArrayChange("recall_preferences", "classifier", "false_negative_examples", idx, e.target.value)}
                                  className={styles.arrayInput}
                                  placeholder="Enter false negative example"
                              />
                              <button
                                  type="button" 
                                  onClick={() => handleAdvancedArrayRemove("recall_preferences", "classifier", "false_negative_examples", idx)}
                                  className={styles.removeButton}
                              >
                                <X size={16} />
                              </button>
                            </div>
                            ))}
                    <button
                              type="button" 
                              onClick={() => handleAdvancedArrayAdd("recall_preferences", "classifier", "false_negative_examples")}
                              className={styles.addButton}
                    >
                      <Plus size={16} />
                              Add False Negative Example
                    </button>
                </div>
              </div>
          </div>

                      {/* Subquery and Keywords Generator Settings */}
                      <div className={styles.advancedSubsection}>
                        <h3 className={styles.subsectionTitle}>Subquery and Keywords Generator</h3>
                        
                        <div className={styles.formGroup}>
                          <label className={styles.advancedLabel}>
                    Custom Instructions
                            <InfoTooltip text={FIELD_INFO['recall_preferences.subquery_and_keywords_generator.custom_instructions']} />
                  </label>
                              <textarea
                            value={form.recall_preferences?.subquery_and_keywords_generator?.custom_instructions || ""}
                            onChange={e => handleNestedChange("recall_preferences", "subquery_and_keywords_generator", {
                              ...form.recall_preferences?.subquery_and_keywords_generator,
                              custom_instructions: e.target.value
                            })}
                            className={styles.textarea}
                            rows={3}
                            placeholder="Enter custom instructions for the generator"
                          />
                </div>

                        <div className={styles.formGrid}>
                          <div className={styles.formGroup}>
                            <label className={styles.advancedLabel}>
                    Subqueries Candidate Nodes Weight
                              <InfoTooltip text={FIELD_INFO['recall_preferences.subquery_and_keywords_generator.subqueries_candidate_nodes_weight']} />
                  </label>
                    <input
                      type="number"
                              step="0.01"
                              min="0"
                              max="1"
                              value={form.recall_preferences?.subquery_and_keywords_generator?.subqueries_candidate_nodes_weight || ""}
                              onChange={e => handleNestedChange("recall_preferences", "subquery_and_keywords_generator", {
                                ...form.recall_preferences?.subquery_and_keywords_generator,
                                subqueries_candidate_nodes_weight: Number(e.target.value)
                              })}
                              onBlur={e => handleNumberBlur("recall_preferences.subquery_and_keywords_generator", "subqueries_candidate_nodes_weight", e.target.value)}
                      className={styles.numberInput}
                              placeholder="Weight (0-1)"
                            />
                    </div>

                          <div className={styles.formGroup}>
                            <label className={styles.advancedLabel}>
                              Subqueries Candidate Memories Weight
                              <InfoTooltip text={FIELD_INFO['recall_preferences.subquery_and_keywords_generator.subqueries_candidate_memories_weight']} />
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="1"
                              value={form.recall_preferences?.subquery_and_keywords_generator?.subqueries_candidate_memories_weight || ""}
                              onChange={e => handleNestedChange("recall_preferences", "subquery_and_keywords_generator", {
                                ...form.recall_preferences?.subquery_and_keywords_generator,
                                subqueries_candidate_memories_weight: Number(e.target.value)
                              })}
                              onBlur={e => handleNumberBlur("recall_preferences.subquery_and_keywords_generator", "subqueries_candidate_memories_weight", e.target.value)}
                              className={styles.numberInput}
                              placeholder="Weight (0-1)"
                            />
                          </div>
                </div>

                        <div className={styles.formGroup}>
                          <label className={styles.advancedLabel}>
                    Example Subqueries
                            <InfoTooltip text={FIELD_INFO['recall_preferences.subquery_and_keywords_generator.example_subqueries']} />
                  </label>
                          <div className={styles.arrayContainer}>
                            {(form.recall_preferences?.subquery_and_keywords_generator?.example_subqueries || []).map((item, idx) => (
                              <div key={idx} className={styles.arrayItem}>
                              <input
                                type="text"
                                  value={item}
                                  onChange={e => handleAdvancedArrayChange("recall_preferences", "subquery_and_keywords_generator", "example_subqueries", idx, e.target.value)}
                                  className={styles.arrayInput}
                                  placeholder="Enter example subquery"
                              />
                              <button
                                  type="button" 
                                  onClick={() => handleAdvancedArrayRemove("recall_preferences", "subquery_and_keywords_generator", "example_subqueries", idx)}
                                  className={styles.removeButton}
                              >
                                <X size={16} />
                              </button>
                            </div>
                            ))}
                    <button
                              type="button" 
                              onClick={() => handleAdvancedArrayAdd("recall_preferences", "subquery_and_keywords_generator", "example_subqueries")}
                              className={styles.addButton}
                    >
                      <Plus size={16} />
                              Add Example Subquery
                    </button>
                          </div>
                </div>

                        <div className={styles.formGrid}>
                          <div className={styles.formGroup}>
                            <label className={styles.advancedLabel}>
                    Keywords Candidate Nodes Weight
                              <InfoTooltip text={FIELD_INFO['recall_preferences.subquery_and_keywords_generator.keywords_candidate_nodes_weight']} />
                  </label>
                    <input
                      type="number"
                              step="0.01"
                              min="0"
                              max="1"
                              value={form.recall_preferences?.subquery_and_keywords_generator?.keywords_candidate_nodes_weight || ""}
                              onChange={e => handleNestedChange("recall_preferences", "subquery_and_keywords_generator", {
                                ...form.recall_preferences?.subquery_and_keywords_generator,
                                keywords_candidate_nodes_weight: Number(e.target.value)
                              })}
                              onBlur={e => handleNumberBlur("recall_preferences.subquery_and_keywords_generator", "keywords_candidate_nodes_weight", e.target.value)}
                      className={styles.numberInput}
                              placeholder="Weight (0-1)"
                            />
                    </div>

                          <div className={styles.formGroup}>
                            <label className={styles.advancedLabel}>
                              Keywords Candidate Memories Weight
                              <InfoTooltip text={FIELD_INFO['recall_preferences.subquery_and_keywords_generator.keywords_candidate_memories_weight']} />
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="1"
                              value={form.recall_preferences?.subquery_and_keywords_generator?.keywords_candidate_memories_weight || ""}
                              onChange={e => handleNestedChange("recall_preferences", "subquery_and_keywords_generator", {
                                ...form.recall_preferences?.subquery_and_keywords_generator,
                                keywords_candidate_memories_weight: Number(e.target.value)
                              })}
                              onBlur={e => handleNumberBlur("recall_preferences.subquery_and_keywords_generator", "keywords_candidate_memories_weight", e.target.value)}
                              className={styles.numberInput}
                              placeholder="Weight (0-1)"
                            />
                          </div>
                </div>

                        <div className={styles.formGroup}>
                          <label className={styles.advancedLabel}>
                            Example Keywords
                            <InfoTooltip text={FIELD_INFO['recall_preferences.subquery_and_keywords_generator.example_keywords']} />
                          </label>
                          <div className={styles.arrayContainer}>
                            {(form.recall_preferences?.subquery_and_keywords_generator?.example_keywords || []).map((item, idx) => (
                              <div key={idx} className={styles.arrayItem}>
                              <input
                                type="text"
                                  value={item}
                                  onChange={e => handleAdvancedArrayChange("recall_preferences", "subquery_and_keywords_generator", "example_keywords", idx, e.target.value)}
                                  className={styles.arrayInput}
                                  placeholder="Enter example keyword"
                              />
                              <button
                                  type="button" 
                                  onClick={() => handleAdvancedArrayRemove("recall_preferences", "subquery_and_keywords_generator", "example_keywords", idx)}
                                  className={styles.removeButton}
                              >
                                <X size={16} />
                              </button>
                            </div>
                            ))}
                    <button
                              type="button" 
                              onClick={() => handleAdvancedArrayAdd("recall_preferences", "subquery_and_keywords_generator", "example_keywords")}
                              className={styles.addButton}
                    >
                      <Plus size={16} />
                              Add Example Keyword
                    </button>
                </div>
              </div>
          </div>
                    </div>
                )}
            </div>
                            </div>
                        </div>
          </div>

          {/* Generation Preferences */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Generation Preferences</h2>
              <p className={styles.sectionDescription}>
                Configure how the system generates and processes content
              </p>
                </div>

            <div className={styles.preferencesCard}>
              <div className={styles.cardContent}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                    Top K Semantic Similarity Check
                      <InfoTooltip text={FIELD_INFO.top_k_symantic_similarity_check} />
                  </label>
                    <input
                      type="number"
                      value={form.generation_preferences?.top_k_symantic_similarity_check || ""}
                      onChange={e => handleNestedChange("generation_preferences", "top_k_symantic_similarity_check", Number(e.target.value))}
                      onBlur={e => handleNumberBlur("generation_preferences", "top_k_symantic_similarity_check", e.target.value)}
                      className={`${styles.numberInput} ${validationErrors['generation_preferences.top_k_symantic_similarity_check'] ? styles.inputError : ''}`}
                      min="1"
                      max="10"
                      placeholder="Top K (1-10)"
                    />
                    {validationErrors['generation_preferences.top_k_symantic_similarity_check'] && (
                      <span className={styles.errorText}>{validationErrors['generation_preferences.top_k_symantic_similarity_check']}</span>
                  )}
                </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                    Raise Merge Conflict
                      <InfoTooltip text={FIELD_INFO.raise_merge_conflict} />
                  </label>
                    <div className={styles.switchContainer}>
                      <input
                        type="checkbox"
                        id="raise_merge_conflict"
                        checked={!!form.generation_preferences?.raise_merge_conflict}
                        onChange={e => handleNestedChange("generation_preferences", "raise_merge_conflict", e.target.checked)}
                        className={styles.switchInput}
                      />
                      <label htmlFor="raise_merge_conflict" className={styles.switchLabel}></label>
                    </div>
                    </div>
                </div>

                {/* Advanced Generation Preferences */}
                <div className={styles.advancedSection}>
            <button
                    type="button"
                    onClick={() => setShowAdvancedGeneration(!showAdvancedGeneration)}
                    className={styles.advancedToggle}
            >
                    {showAdvancedGeneration ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    <span>Advanced Generation Settings</span>
            </button>
                  
                  {showAdvancedGeneration && (
                    <div className={styles.advancedContent}>
                      <div className={styles.formGroup}>
                        <label className={styles.advancedLabel}>
                          Custom Instructions
                          <InfoTooltip text={FIELD_INFO['generation_preferences.custom_instructions']} />
                        </label>
                        <textarea
                          value={form.generation_preferences?.custom_instructions || ""}
                          onChange={e => handleNestedChange("generation_preferences", "custom_instructions", e.target.value)}
                          className={styles.textarea}
                          rows={3}
                          placeholder="Enter custom instructions for generation"
                        />
              </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
                </div>

          {/* Submit Button */}
          <div className={styles.submitSection}>
                  <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              <Save size={18} />
              {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectSettings;
