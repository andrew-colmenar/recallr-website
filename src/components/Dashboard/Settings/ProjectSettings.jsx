import React, { useState, useEffect } from "react";
import { useProjectContext } from "../../../context/ProjectContext";
import { appApi } from "../../../api/axios";
import Cookies from "js-cookie";
import { useSearchParams } from "react-router-dom";
import { Info } from "lucide-react";

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

const ADVANCED_FIELDS = [
  'recall_preferences.classifier.custom_instructions',
  'recall_preferences.classifier.false_positive_examples',
  'recall_preferences.classifier.false_negative_examples',
  'recall_preferences.subquery_and_keywords_generator.custom_instructions',
  'recall_preferences.subquery_and_keywords_generator.subqueries_candidate_nodes_weight',
  'recall_preferences.subquery_and_keywords_generator.subqueries_candidate_memories_weight',
  'recall_preferences.subquery_and_keywords_generator.example_subqueries',
  'recall_preferences.subquery_and_keywords_generator.keywords_candidate_nodes_weight',
  'recall_preferences.subquery_and_keywords_generator.keywords_candidate_memories_weight',
  'recall_preferences.subquery_and_keywords_generator.example_keywords',
  'generation_preferences.custom_instructions',
];

const ProjectSettings = () => {
  const { currentProject, setCurrentProject } = useProjectContext();
  const [form, setForm] = useState(currentProject ? JSON.parse(JSON.stringify(currentProject)) : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchParams] = useSearchParams();
  const [showAdvanced, setShowAdvanced] = useState(false);

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
          setCurrentProject(response.data);
          setForm(JSON.parse(JSON.stringify(response.data)));
        })
        .catch((err) => {
          setError(err.response?.data?.detail || err.message || "Failed to load project.");
        })
        .finally(() => setLoading(false));
    } else {
      setForm(JSON.parse(JSON.stringify(currentProject)));
    }
  }, [searchParams, currentProject, setCurrentProject]);

  if (loading) {
    return <div style={{ padding: 32, textAlign: "center" }}>Loading project...</div>;
  }
  if (!form) {
    return <div style={{ padding: 32, textAlign: "center" }}>No project selected.</div>;
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
  };

  // For advanced array fields
  const handleAdvancedArrayChange = (path, idx, value) => {
    const parts = path.split(".");
    setForm((prev) => {
      const updated = { ...prev };
      let ref = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        ref = ref[parts[i]];
      }
      ref[parts[parts.length - 1]][idx] = value;
      return updated;
    });
  };
  const handleAdvancedArrayAdd = (path) => {
    const parts = path.split(".");
    setForm((prev) => {
      const updated = { ...prev };
      let ref = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        ref = ref[parts[i]];
      }
      ref[parts[parts.length - 1]].push("");
      return updated;
    });
  };
  const handleAdvancedArrayRemove = (path, idx) => {
    const parts = path.split(".");
    setForm((prev) => {
      const updated = { ...prev };
      let ref = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        ref = ref[parts[i]];
      }
      ref[parts[parts.length - 1]].splice(idx, 1);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 32 }}>
      <h1 style={{ fontSize: "2rem", marginBottom: 24 }}>Project Settings</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 600, fontSize: 18 }}>Project Name</label>
          <input
            type="text"
            name="name"
            value={form.name || ""}
            onChange={handleInputChange}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc", fontSize: 16, marginTop: 6 }}
            required
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 600, fontSize: 18 }}>Description</label>
          <textarea
            name="description"
            value={form.description || ""}
            onChange={handleInputChange}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc", fontSize: 16, marginTop: 6 }}
            rows={3}
          />
        </div>
        {/* Recall Preferences Card */}
        <div style={{ background: "#f7f7fa", borderRadius: 10, padding: 24, marginBottom: 28, boxShadow: "0 2px 8px rgba(59,130,246,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
            <span style={{ fontWeight: 700, fontSize: 18 }}>Recall Preferences</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
            <label style={{ flex: 1 }}>Return Min Top K <InfoTooltip text={FIELD_INFO.return_min_top_k} /></label>
            <input
              type="number"
              value={form.recall_preferences?.return_min_top_k || 0}
              onChange={e => handleNestedChange("recall_preferences", "return_min_top_k", Number(e.target.value))}
              style={{ width: 100, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 15 }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
            <label style={{ flex: 1 }}>Return Max Top K <InfoTooltip text={FIELD_INFO.return_max_top_k} /></label>
            <input
              type="number"
              value={form.recall_preferences?.return_max_top_k || 0}
              onChange={e => handleNestedChange("recall_preferences", "return_max_top_k", Number(e.target.value))}
              style={{ width: 100, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 15 }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
            <label style={{ flex: 1 }}>Threshold <InfoTooltip text={FIELD_INFO.threshold} /></label>
            <input
              type="number"
              step="0.01"
              value={form.recall_preferences?.threshold || 0}
              onChange={e => handleNestedChange("recall_preferences", "threshold", Number(e.target.value))}
              style={{ width: 100, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 15 }}
            />
          </div>
          {/* Advanced Recall Preferences */}
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            style={{
              background: showAdvanced ? "#232B3A" : "#e5e7eb",
              color: showAdvanced ? "#fff" : "#374151",
              border: "none",
              borderRadius: 8,
              padding: "0.6rem 1.2rem",
              fontWeight: 500,
              fontSize: "1rem",
              cursor: "pointer",
              marginTop: 10,
              marginBottom: 10,
              transition: "background 0.2s, color 0.2s",
            }}
          >
            {showAdvanced ? "▼" : "►"} Advanced Recall Preferences
          </button>
          {showAdvanced && (
            <div style={{ marginTop: 10, background: "#f3f4f6", borderRadius: 8, padding: 16 }}>
              {/* Array and number fields for advanced recall preferences */}
              {ADVANCED_FIELDS.filter(f => f.startsWith("recall_preferences")).map((field) => {
                const label = field.split(".").slice(-1)[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const value = field.includes("custom_instructions") || field.includes("examples") || field.includes("keywords")
                  ? form.recall_preferences?.classifier?.[label] || form.recall_preferences?.subquery_and_keywords_generator?.[label] || []
                  : form.recall_preferences?.subquery_and_keywords_generator?.[label] || 0;
                // Array fields
                if (Array.isArray(value)) {
                  return (
                    <div key={field} style={{ marginBottom: 14 }}>
                      <label style={{ fontWeight: 500 }}>{label} <InfoTooltip text={FIELD_INFO[field]} /></label>
                      {value.map((item, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                          <input
                            type="text"
                            value={item}
                            onChange={e => handleAdvancedArrayChange(field, idx, e.target.value)}
                            style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 15, marginRight: 8 }}
                          />
                          <button type="button" onClick={() => handleAdvancedArrayRemove(field, idx)} style={{ color: "#EF4444", background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>×</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => handleAdvancedArrayAdd(field)} style={{ color: "#3B82F6", background: "none", border: "none", fontWeight: 500, fontSize: "1rem", cursor: "pointer" }}>+ Add</button>
                    </div>
                  );
                } else {
                  // Number fields
                  return (
                    <div key={field} style={{ marginBottom: 14 }}>
                      <label style={{ fontWeight: 500 }}>{label} <InfoTooltip text={FIELD_INFO[field]} /></label>
                      <input
                        type="number"
                        value={value}
                        onChange={e => handleNestedChange("recall_preferences.subquery_and_keywords_generator", label, Number(e.target.value))}
                        style={{ width: 100, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 15, marginLeft: 8 }}
                      />
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>
        {/* Generation Preferences Card */}
        <div style={{ background: "#f7f7fa", borderRadius: 10, padding: 24, marginBottom: 28, boxShadow: "0 2px 8px rgba(59,130,246,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
            <span style={{ fontWeight: 700, fontSize: 18 }}>Generation Preferences</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
            <label style={{ flex: 1 }}>Top K Symantic Similarity Check <InfoTooltip text={FIELD_INFO.top_k_symantic_similarity_check} /></label>
            <input
              type="number"
              value={form.generation_preferences?.top_k_symantic_similarity_check || 0}
              onChange={e => handleNestedChange("generation_preferences", "top_k_symantic_similarity_check", Number(e.target.value))}
              style={{ width: 100, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 15 }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
            <label style={{ flex: 1 }}>Raise Merge Conflict <InfoTooltip text={FIELD_INFO.raise_merge_conflict} /></label>
            <input
              type="checkbox"
              checked={!!form.generation_preferences?.raise_merge_conflict}
              onChange={e => handleNestedChange("generation_preferences", "raise_merge_conflict", e.target.checked)}
              style={{ marginLeft: 8 }}
            />
          </div>
          {/* Advanced Generation Preferences */}
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            style={{
              background: showAdvanced ? "#232B3A" : "#e5e7eb",
              color: showAdvanced ? "#fff" : "#374151",
              border: "none",
              borderRadius: 8,
              padding: "0.6rem 1.2rem",
              fontWeight: 500,
              fontSize: "1rem",
              cursor: "pointer",
              marginTop: 10,
              marginBottom: 10,
              transition: "background 0.2s, color 0.2s",
            }}
          >
            {showAdvanced ? "▼" : "►"} Advanced Generation Preferences
          </button>
          {showAdvanced && (
            <div style={{ marginTop: 10, background: "#f3f4f6", borderRadius: 8, padding: 16 }}>
              {/* Array fields for advanced generation preferences */}
              {ADVANCED_FIELDS.filter(f => f.startsWith("generation_preferences")).map((field) => {
                const label = field.split(".").slice(-1)[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const value = form.generation_preferences?.[label] || [];
                return (
                  <div key={field} style={{ marginBottom: 14 }}>
                    <label style={{ fontWeight: 500 }}>{label} <InfoTooltip text={FIELD_INFO[field]} /></label>
                    {value.map((item, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                        <input
                          type="text"
                          value={item}
                          onChange={e => handleAdvancedArrayChange(field, idx, e.target.value)}
                          style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ccc", fontSize: 15, marginRight: 8 }}
                        />
                        <button type="button" onClick={() => handleAdvancedArrayRemove(field, idx)} style={{ color: "#EF4444", background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>×</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => handleAdvancedArrayAdd(field)} style={{ color: "#3B82F6", background: "none", border: "none", fontWeight: 500, fontSize: "1rem", cursor: "pointer" }}>+ Add</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {error && <div style={{ color: "#EF4444", marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ color: "#22C55E", marginBottom: 12 }}>{success}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#3B82F6",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "0.7rem 1.5rem",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default ProjectSettings;
