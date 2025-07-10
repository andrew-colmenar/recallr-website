import React, { useState, useEffect } from "react";
import { Key, Plus, Copy, Trash2, Eye, EyeOff, X } from "lucide-react";
import styles from "./APIKeys.module.css";
import { useProjectContext } from "../../../context/ProjectContext";
import { appApi } from "../../../api/axios";
import Cookies from "js-cookie";

const APIKeys = () => {
  const { currentProjectId } = useProjectContext();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKey, setShowKey] = useState({}); // { [id]: true/false }
  const [newKeyName, setNewKeyName] = useState("");
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [createdKey, setCreatedKey] = useState(null); // { id, key, ... }
  const [deletingId, setDeletingId] = useState(null);

  // Fetch API keys on mount
  useEffect(() => {
    if (!currentProjectId) return;
    fetchKeys();
    // eslint-disable-next-line
  }, [currentProjectId]);

  const fetchKeys = async () => {
    setLoading(true);
    setError(null);
    try {
      const user_id = Cookies.get("user_id");
      const session_id = Cookies.get("session_id");
      if (!user_id || !session_id) throw new Error("Authentication required. Please log in again.");
      const res = await appApi.get(`/api/v1/projects/${currentProjectId}/api-keys`, {
        headers: {
          "X-User-Id": user_id,
          "X-Session-Id": session_id,
        },
        params: { offset: 0, limit: 100 },
      });
      setKeys(res.data.api_keys || res.data.keys || []);
    } catch (err) {
      let message = "Failed to load API keys.";
      if (err.response) {
        if (err.response.status === 404) {
          message = "Project not found. Please check if the project exists and you have access.";
        } else if (err.response.status === 401) {
          message = "Authentication required. Please log in again.";
        } else if (err.response.status === 403) {
          message = "You do not have permission to access this project.";
        } else if (err.response.data?.detail) {
          message = err.response.data.detail;
        }
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Create API key
  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const user_id = Cookies.get("user_id");
      const session_id = Cookies.get("session_id");
      if (!user_id || !session_id) throw new Error("Authentication required");
      const res = await appApi.post(
        `/api/v1/projects/${currentProjectId}/api-keys`,
        { name: newKeyName },
        {
          headers: {
            "X-User-Id": user_id,
            "X-Session-Id": session_id,
          },
        }
      );
      // Show modal with full key, add to list (but only show last 4 in list)
      setCreatedKey(res.data);
      setShowKeyModal(true);
      setShowCreateModal(false);
      setNewKeyName("");
      // Add to list, but only show last 4 chars in main list
      setKeys((prev) => [
        ...prev,
        {
          ...res.data,
          key: undefined, // Don't store full key in list
        },
      ]);
    } catch (err) {
      setCreateError(
        err.response?.data?.detail || err.message || "Failed to create API key."
      );
    } finally {
      setCreating(false);
    }
  };

  // Delete API key
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this API key? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const user_id = Cookies.get("user_id");
      const session_id = Cookies.get("session_id");
      if (!user_id || !session_id) throw new Error("Authentication required");
      await appApi.delete(`/api/v1/projects/${currentProjectId}/api-keys/${id}`, {
        headers: {
          "X-User-Id": user_id,
          "X-Session-Id": session_id,
        },
      });
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Failed to delete API key."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Copy key to clipboard (for modal only)
  const handleCopy = (key, id) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 1500);
  };

  // Only show last 4 chars in list
  const maskKey = (key) => {
    if (!key) return "****";
    return "****" + key.slice(-4);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div className={styles.headerIcon}><Key size={28} /></div>
        <div>
          <h1 className={styles.title}>API Keys</h1>
          <p className={styles.subtitle}>Manage your project's API keys. Keep your keys secure and never share them publicly.</p>
        </div>
        {/* Hide header button if no keys and not loading */}
        {(!loading && keys.length > 0) && (
          <button className={styles.createButton} onClick={() => setShowCreateModal(true)}>
            <Plus size={18} /> New API Key
          </button>
        )}
      </div>

      {/* Error message */}
      {error && <div className={styles.emptyState} style={{color: 'var(--error-color)'}}>{error}</div>}

      {/* Keys List */}
      <div className={styles.keysSection}>
        {loading ? (
          <div className={styles.emptyState}><span>Loading...</span></div>
        ) : keys.length === 0 ? (
          <div className={styles.emptyState}>
            <Key size={48} />
            <h2>No API Keys</h2>
            <p>You haven't created any API keys yet.</p>
            <button className={styles.createButton} onClick={() => setShowCreateModal(true)}>
              <Plus size={18} /> Create API Key
            </button>
          </div>
        ) : (
          <div className={styles.keysList}>
            {keys.map((k) => (
              <div className={styles.keyCard} key={k.id}>
                <div className={styles.keyInfo}>
                  <div className={styles.keyName}>{k.name}</div>
                  <div className={styles.keyMeta}>
                    <span>Created: {new Date(k.created_at).toLocaleDateString()}</span>
                    <span>Last used: {k.last_used ? new Date(k.last_used).toLocaleDateString() : "Never"}</span>
                  </div>
                </div>
                <div className={styles.keyValueRow}>
                  <div className={styles.keyValueBox}>
                    <span className={styles.keyValue}>{maskKey(k.last_four || k.key)}</span>
                  </div>
                  <div className={styles.keyActions}>
                    <button className={styles.iconButton} onClick={() => handleDelete(k.id)} disabled={deletingId === k.id}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Create API Key</h2>
              <button className={styles.iconButton} onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateKey} className={styles.modalForm}>
              <label className={styles.label}>Key Name</label>
              <input
                className={styles.input}
                type="text"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                placeholder="e.g. Production Key"
                autoFocus
                required
              />
              {createError && <div style={{color: 'var(--error-color)', fontSize: '0.95rem'}}>{createError}</div>}
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.createButton} disabled={creating}>
                  <Plus size={16} /> {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Show full key ONCE after creation */}
      {showKeyModal && createdKey && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>API Key Created</h2>
              <button className={styles.iconButton} onClick={() => { setShowKeyModal(false); setCreatedKey(null); }}>
                <X size={20} />
              </button>
            </div>
            <div style={{marginBottom: '1rem', color: 'var(--text-secondary)'}}>
              <strong>This is the only time you'll see the full API key.</strong> Please copy it now. You will not be able to view or copy it again!
            </div>
            <div className={styles.keyValueBox} style={{marginBottom: '1.5rem', fontSize: '1.1rem', justifyContent: 'space-between'}}>
              <span className={styles.keyValue}>{createdKey.key}</span>
              <button className={styles.iconButton} onClick={() => handleCopy(createdKey.key, createdKey.id)}>
                <Copy size={18} />
                {copiedKeyId === createdKey.id && <span className={styles.copiedText}>Copied!</span>}
              </button>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.createButton} onClick={() => { setShowKeyModal(false); setCreatedKey(null); }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default APIKeys;
