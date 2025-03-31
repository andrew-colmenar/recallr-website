import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { appApi } from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import Cookies from 'js-cookie';
import { AlertCircle, UserIcon, Copy, Check } from 'lucide-react'; // Added Copy and Check icons
import styles from './Users.module.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 7,
    total: 0,
    hasMore: false
  });
  const [copiedProjectId, setCopiedProjectId] = useState(false); // New state for project ID copy

  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');

  // Function to format date string - reusing the same format as APIKeys component
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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

  const fetchUsers = async (offset = 0, limit = 7) => {
    try {
      setLoading(true);
      
      const user_id = Cookies.get('user_id');
      const session_id = Cookies.get('session_id');
      
      if (!user_id || !session_id) {
        throw new Error('Authentication required');
      }
      
      const response = await appApi.get(`/projects/${projectId}/users`, {
        params: { offset, limit },
        headers: {
          'X-User-Id': user_id,
          'X-Session-Id': session_id
        }
      });
      
      setUsers(response.data.users || []);
      setPagination({
        offset,
        limit,
        total: response.data.total || 0,
        hasMore: response.data.has_more || false
      });
      setError(null);
    } catch (err) {
      let errorMessage = 'Failed to fetch users. Please try again later.';
      
      if (err.response?.status === 404) {
        errorMessage = 'Project not found or users feature is not available.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have access to this project\'s users.';
      }
      
      setError(errorMessage);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchUsers();
    }
  }, [projectId]);

  const handleNextPage = () => {
    const newOffset = pagination.offset + pagination.limit;
    fetchUsers(newOffset, pagination.limit);
  };

  const handlePrevPage = () => {
    const newOffset = Math.max(0, pagination.offset - pagination.limit);
    fetchUsers(newOffset, pagination.limit);
  };

  // Copy to clipboard function
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedProjectId(true);
      setTimeout(() => setCopiedProjectId(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header - updated with copy button */}
        <div className={styles.header}>
          <h1 className={styles.title}>Project Users</h1>
          <div className={styles.projectId}>
            Project ID: <span className={styles.mono}>{projectId || 'Loading...'}</span>
            <button 
              className={`${styles.iconButton} ${copiedProjectId ? styles.copied : ''}`}
              onClick={() => copyToClipboard(projectId)}
              aria-label="Copy project ID"
            >
              {copiedProjectId ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
        
        {/* Error message display - matching APIKeys */}
        {error && (
          <div className={styles.errorMessage}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        
        {/* Users Table - using the same structure as APIKeys table */}
        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading users...</p>
            </div>
          ) : users.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th className={styles.headerCell}>User ID</th>
                  <th className={styles.headerCell}>Created At</th>
                  <th className={styles.headerCell}>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr key={userItem.user_id} className={styles.tableRow}>
                    <td className={styles.cell}>
                      <span className={styles.mono}>{userItem.user_id}</span>
                    </td>
                    <td className={styles.cell}>{formatDate(userItem.created_at)}</td>
                    <td className={styles.cell}>{formatDate(userItem.last_active_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyState}>
              <UserIcon size={32} />
              <p>No users found in this project.</p>
            </div>
          )}
        </div>
        
        {/* Pagination - similar to how it would be structured in APIKeys */}
        {users.length > 0 && !loading && (
          <div className={styles.paginationContainer}>
            <div className={styles.paginationInfo}>
              Showing {pagination.offset + 1} - {Math.min(pagination.offset + users.length, pagination.total)} of {pagination.total} users
            </div>
            <div className={styles.paginationButtons}>
              <button 
                className={styles.paginationButton} 
                onClick={handlePrevPage}
                disabled={pagination.offset === 0}
              >
                Previous
              </button>
              <button 
                className={styles.paginationButton} 
                onClick={handleNextPage}
                disabled={!pagination.hasMore}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;