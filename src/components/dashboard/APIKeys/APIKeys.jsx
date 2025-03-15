import React, { useState, useEffect } from 'react';
import { appApi } from '../../../api/axios';
import Cookies from 'js-cookie';
import { AlertCircle, Copy, Trash2, X, Check, Plus } from 'lucide-react';
import styles from './APIKeys.module.css';

const APIKeys = ({ project }) => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [newKey, setNewKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [deletingKeyId, setDeletingKeyId] = useState(null);
  // New state for delete confirmation
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState(null);

  // Function to format date string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Fetch API keys for the current project
  useEffect(() => {
    const fetchApiKeys = async () => {
      if (!project || !project.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const user_id = Cookies.get('user_id');
        const session_id = Cookies.get('session_id');
        
        if (!user_id || !session_id) {
          throw new Error('Authentication required');
        }
        
        const response = await appApi.get(`projects/${project.id}/api-keys`, {
          headers: {
            'X-User-Id': user_id,
            'X-Session-Id': session_id
          }
        });
        
        setApiKeys(response.data.keys || []);
      } catch (err) {
        console.error('Error fetching API keys:', err);
        
        if (err.response?.status === 404) {
          setError('Project not found or API keys feature is not available.');
        } else if (err.response?.status === 403) {
          setError('You do not have access to this project\'s API keys.');
        } else {
          setError('Failed to load API keys. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchApiKeys();
  }, [project]);

  // Create a new API key
  const handleCreateKey = async (e) => {
    e.preventDefault();
    
    if (!newKeyName.trim()) {
      setCreateError('API key name is required');
      return;
    }
    
    try {
      setIsCreating(true);
      setCreateError(null);
      
      const user_id = Cookies.get('user_id');
      const session_id = Cookies.get('session_id');
      
      if (!user_id || !session_id) {
        throw new Error('Authentication required');
      }
      
      const response = await appApi.post(`projects/${project.id}/api-keys`, {
        name: newKeyName
      }, {
        headers: {
          'X-User-Id': user_id,
          'X-Session-Id': session_id
        }
      });
      
      // Set the new key to show in the success modal
      setNewKey(response.data);
      
      // Reset form
      setNewKeyName('');
      setCopiedKey(false);
      
      setApiKeys(prevKeys => [...prevKeys, {
        id: response.data.id,
        name: response.data.name,
        prefix: response.data.key.substring(0, 8), // Show first 8 characters consistently
        created_at: response.data.created_at
      }]);
      
      // Store the created API key in localStorage for use with the Users component
      localStorage.setItem('api_key', response.data.key);
      console.log('API key saved to localStorage');
    } catch (err) {
      console.error('Error creating API key:', err);
      
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          setCreateError(err.response.data.detail[0]?.msg || 'Failed to create API key');
        } else {
          setCreateError(err.response.data.detail || 'Failed to create API key');
        }
      } else if (err.response?.status === 403) {
        setCreateError('You do not have permission to create API keys for this project');
      } else {
        setCreateError('Failed to create API key. Please try again.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Show delete confirmation dialog
  const confirmDeleteKey = (key) => {
    setKeyToDelete(key);
    setShowDeleteConfirmation(true);
  };

  // Cancel delete operation
  const cancelDelete = () => {
    setKeyToDelete(null);
    setShowDeleteConfirmation(false);
  };

  // Revoke (delete) an API key after confirmation
  const handleRevokeKey = async () => {
    if (!keyToDelete) return;
    
    try {
      setDeletingKeyId(keyToDelete.id);
      
      const user_id = Cookies.get('user_id');
      const session_id = Cookies.get('session_id');
      
      if (!user_id || !session_id) {
        throw new Error('Authentication required');
      }
      
      await appApi.delete(`projects/${project.id}/api-keys/${keyToDelete.id}`, {
        headers: {
          'X-User-Id': user_id,
          'X-Session-Id': session_id
        }
      });
      
      // Update the list by removing the revoked key
      setApiKeys(prevKeys => prevKeys.filter(key => key.id !== keyToDelete.id));
      
      // Check if the deleted key is stored in localStorage
      const storedKeyPrefix = localStorage.getItem('api_key')?.substring(0, 8);
      const deletedKeyPrefix = keyToDelete.prefix;
      
      if (storedKeyPrefix === deletedKeyPrefix) {
        localStorage.removeItem('api_key');
        console.log('Removed revoked API key from localStorage');
      }
      
      // Close the confirmation dialog
      setShowDeleteConfirmation(false);
      setKeyToDelete(null);
      
    } catch (err) {
      console.error('Error revoking API key:', err);
      
      let errorMessage = 'Failed to revoke API key';
      
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail[0]?.msg || errorMessage;
        } else {
          errorMessage = err.response.data.detail || errorMessage;
        }
      } else if (err.response?.status === 404) {
        errorMessage = 'API key not found';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to revoke this API key';
      }
      
      setError(errorMessage);
      
    } finally {
      setDeletingKeyId(null);
    }
  };

  // Copy key to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(true);
      
      // Reset the copied state after 3 seconds
      setTimeout(() => {
        setCopiedKey(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>API Keys</h1>
          <div className={styles.projectId}>
            Project ID: <span className={styles.mono}>{project?.id || 'Loading...'}</span>
          </div>
        </div>
        
        {/* Info box explaining API keys */}
        <div className={styles.infoBox}>
          <h3>About API Keys</h3>
          <p>
            API keys are used to authenticate requests to the Recall API. You can create multiple keys for different environments.
          </p>
          <p>
            For security reasons, you can only view and copy the full API key once when it's created.
          </p>
        </div>
        
        {/* Error message display */}
        {error && (
          <div className={styles.errorMessage}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        
        {/* API Keys Table */}
        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading API keys...</p>
            </div>
          ) : apiKeys.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th className={styles.headerCell}>Name</th>
                  <th className={styles.headerCell}>Prefix</th>
                  <th className={styles.headerCell}>Created At</th>
                  <th className={styles.headerCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((keyItem) => (
                  <tr key={keyItem.id} className={styles.tableRow}>
                    <td className={styles.cell}>{keyItem.name}</td>
                    <td className={styles.cell}>
                      <span className={styles.mono}>{keyItem.prefix}</span>
                    </td>
                    <td className={styles.cell}>{formatDate(keyItem.created_at)}</td>
                    <td className={styles.cell}>
                      <button 
                        className={`${styles.iconButton} ${styles.deleteButton}`}
                        onClick={() => confirmDeleteKey(keyItem)}
                        disabled={deletingKeyId === keyItem.id}
                        title="Revoke API key"
                      >
                        {deletingKeyId === keyItem.id ? (
                          <div className={styles.buttonSpinner}></div>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyState}>
              <p>No API keys found for this project.</p>
            </div>
          )}
        </div>
        
        {/* Create Key Button */}
        <button 
          className={styles.createButton}
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={16} />
          <span>Create API Key</span>
        </button>
        
        {/* Create Key Modal */}
        {showCreateModal && !newKey && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Create New API Key</h3>
                <button 
                  className={styles.closeButton}
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateError(null);
                    setNewKeyName('');
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className={styles.modalBody}>
                {createError && (
                  <div className={styles.errorMessage}>
                    <AlertCircle size={16} />
                    <span>{createError}</span>
                  </div>
                )}
                
                <form onSubmit={handleCreateKey}>
                  <div className={styles.formGroup}>
                    <label htmlFor="keyName">API Key Name *</label>
                    <input
                      type="text"
                      id="keyName"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g. Production API Key"
                      required
                    />
                  </div>
                  
                  <div className={styles.modalActions}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={() => {
                        setShowCreateModal(false);
                        setCreateError(null);
                        setNewKeyName('');
                      }}
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="submit"
                      className={styles.submitButton}
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <>
                          <div className={styles.buttonSpinner}></div>
                          <span>Creating...</span>
                        </>
                      ) : 'Create Key'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Success Modal for New API Key */}
        {newKey && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>API Key Created</h3>
                <button 
                  className={styles.closeButton}
                  onClick={() => {
                    setNewKey(null);
                    setShowCreateModal(false);
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.successMessage}>
                  <p>
                    <strong>This is the only time you'll see the complete API key.</strong> Please copy it now as you won't be able to see it again!
                  </p>
                                  </div>
                
                <div className={styles.keyDisplay}>
                  <div className={styles.keyValue}>
                    <span className={styles.mono}>{newKey.key}</span>
                  </div>
                  
                  <button
                    className={`${styles.copyButton} ${copiedKey ? styles.copied : ''}`}
                    onClick={() => copyToClipboard(newKey.key)}
                  >
                    {copiedKey ? (
                      <>
                        <Check size={16} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className={styles.keyDetails}>
                  <div className={styles.keyDetail}>
                    <span className={styles.keyDetailLabel}>Name:</span>
                    <span className={styles.keyDetailValue}>{newKey.name}</span>
                  </div>
                  <div className={styles.keyDetail}>
                    <span className={styles.keyDetailLabel}>Created:</span>
                    <span className={styles.keyDetailValue}>{formatDate(newKey.created_at)}</span>
                  </div>
                </div>
                
                <div className={styles.modalActions}>
                  <button
                    className={styles.doneButton}
                    onClick={() => {
                      setNewKey(null);
                      setShowCreateModal(false);
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && keyToDelete && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Revoke API Key</h3>
                <button 
                  className={styles.closeButton}
                  onClick={cancelDelete}
                  disabled={deletingKeyId === keyToDelete.id}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.warningMessage}>
                  <AlertCircle size={20} />
                  <div>
                    <p><strong>Are you sure you want to revoke this API key?</strong></p>
                    <p>This action cannot be undone. Any applications using this key will no longer be able to access the API.</p>
                  </div>
                </div>
                
                <div className={styles.keyDetails}>
                  <div className={styles.keyDetail}>
                    <span className={styles.keyDetailLabel}>Name:</span>
                    <span className={styles.keyDetailValue}>{keyToDelete.name}</span>
                  </div>
                  <div className={styles.keyDetail}>
                    <span className={styles.keyDetailLabel}>Prefix:</span>
                    <span className={styles.keyDetailValue}>{keyToDelete.prefix}</span>
                  </div>
                  <div className={styles.keyDetail}>
                    <span className={styles.keyDetailLabel}>Created:</span>
                    <span className={styles.keyDetailValue}>{formatDate(keyToDelete.created_at)}</span>
                  </div>
                </div>
                
                <div className={styles.modalActions}>
                  <button
                    className={styles.cancelButton}
                    onClick={cancelDelete}
                    disabled={deletingKeyId === keyToDelete.id}
                  >
                    Cancel
                  </button>
                  
                  <button
                    className={styles.deleteConfirmButton}
                    onClick={handleRevokeKey}
                    disabled={deletingKeyId === keyToDelete.id}
                  >
                    {deletingKeyId === keyToDelete.id ? (
                      <>
                        <div className={styles.buttonSpinner}></div>
                        <span>Revoking...</span>
                      </>
                    ) : (
                      'Revoke API Key'
                    )}
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

export default APIKeys;