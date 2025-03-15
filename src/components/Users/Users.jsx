// UsersInterface.jsx
import React, { useState, useEffect } from 'react';
import { recallApi } from '../../api/axios';
import Cookies from 'js-cookie';
import styles from './Users.module.css';
import { AlertCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const USERS_PER_PAGE = 10;

const Users = ({ project }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [deleteError, setDeleteError] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project') || (project && project.id);

  // First, try to get the API key when component mounts
  useEffect(() => {
    // Try to get API key from localStorage or sessionStorage or a prop
    const storedApiKey = localStorage.getItem('api_key') || 
                         sessionStorage.getItem('api_key');
    
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      // Show a form to enter API key if not found
      setError('API key is required to view users. Please enter your API key below.');
      setLoading(false);
    }
  }, []);

  // Fetch users when we have both projectId and apiKey
  useEffect(() => {
    if (projectId && apiKey) {
      fetchUsers();
    } else if (projectId && !apiKey) {
      // Only show loading if we're still trying to get the API key
      setLoading(false);
    } else if (!projectId) {
      setError('No project selected. Please select a project.');
      setLoading(false);
    }
  }, [projectId, apiKey, currentPage, sortField, sortDirection]);

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    const formApiKey = e.target.apiKey.value.trim();
    
    if (formApiKey) {
      // Save the API key to localStorage for future use
      localStorage.setItem('api_key', formApiKey);
      setApiKey(formApiKey);
      setError(null);
      setLoading(true); // Reset loading state to fetch users
    } else {
      setError('Please enter a valid API key.');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!apiKey || !projectId) {
        throw new Error('Authentication or project ID missing');
      }
      
      const offset = (currentPage - 1) * USERS_PER_PAGE;
      
      // Make the request to the API
      const response = await recallApi.get('/api/v1/users', {
        headers: {
          'X-Project-Id': projectId,
          'X-Api-Key': apiKey
        },
        params: {
          offset: offset,
          limit: USERS_PER_PAGE
        }
      });
      
      // Extract data from response
      const { users: fetchedUsers, total, has_more } = response.data;
      
      // Handle the case where no users are returned
      if (!Array.isArray(fetchedUsers)) {
        setUsers([]);
        setTotalUsers(0);
        setHasMore(false);
        setError('No user data found.');
        return;
      }
      
      // Sort users if needed
      const sortedUsers = sortUsers(fetchedUsers || []);
      
      setUsers(sortedUsers);
      setTotalUsers(total || 0);
      setHasMore(has_more || false);
      setError(null);
    } catch (err) {
      if (err.response) {
        const errorData = err.response.data;
        
        switch (err.response.status) {
          case 401:
            setError('Authentication failed. Please check your API key.');
            // Clear invalid API key
            localStorage.removeItem('api_key');
            setApiKey('');
            break;
          case 422:
            // Handle validation errors from the API
            let errorMsg = 'Invalid request parameters.';
            if (errorData && errorData.detail) {
              if (Array.isArray(errorData.detail)) {
                errorMsg = errorData.detail.map(e => e.msg || 'Unknown error').join(', ');
              } else if (typeof errorData.detail === 'string') {
                errorMsg = errorData.detail;
              }
            }
            setError(`Validation error: ${errorMsg}`);
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError(`Error ${err.response.status}: ${err.response.statusText || 'Unknown error'}`);
        }
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError(err.message || 'An error occurred while loading users.');
      }
      
      // Set empty array to prevent rendering issues
      setUsers([]);
      setTotalUsers(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Sort users based on current sort field and direction
  const sortUsers = (usersList) => {
    return [...usersList].sort((a, b) => {
      let valueA = a[sortField];
      let valueB = b[sortField];
      
      // Handle dates
      if (sortField === 'created_at' || sortField === 'last_active_at') {
        valueA = new Date(valueA || 0).getTime();
        valueB = new Date(valueB || 0).getTime();
      }
      
      // Handle nulls/undefined values
      if (valueA === undefined || valueA === null) valueA = '';
      if (valueB === undefined || valueB === null) valueB = '';
      
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending
      setSortField(field);
      setSortDirection('desc');
    }
    
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  const getSortIndicator = (field) => {
    if (sortField !== field) return null;
    
    return (
      <span className={styles['sort-indicator']}>
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (hasMore) {
      setCurrentPage(currentPage + 1);
    }
  };

  const openDeleteConfirm = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setUserToDelete(null);
    setShowDeleteConfirm(false);
    setDeleteError(null);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || !apiKey) return;
    
    setDeletingUser(userToDelete.user_id);
    setDeleteError(null);
    
    try {
      if (!apiKey || !projectId) {
        throw new Error('Authentication or project ID missing');
      }
      
      await recallApi.delete(`/api/v1/users/${userToDelete.user_id}`, {
        headers: {
          'X-Project-Id': projectId,
          'X-Api-Key': apiKey
        }
      });
      
      // Remove deleted user from the list
      setUsers(users.filter(user => user.user_id !== userToDelete.user_id));
      
      // Update total count
      setTotalUsers(totalUsers - 1);
      
      // Close the confirmation modal
      closeDeleteConfirm();
      
      // If we deleted the last user on this page and it's not the first page, go back one page
      if (users.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      // Otherwise, if we're on a page with no users now, refresh to get the next batch
      else if (users.length === 1) {
        fetchUsers();
      }
    } catch (err) {
      if (err.response) {
        const errorData = err.response.data;
        
        switch (err.response.status) {
          case 401:
            setDeleteError('Authentication failed. Please check your API key.');
            break;
          case 404:
            setDeleteError('User not found. It may have been already deleted.');
            // Remove from the list if it no longer exists
            setUsers(users.filter(user => user.user_id !== userToDelete.user_id));
            break;
          case 422:
            let errorMsg = 'Invalid request parameters.';
            if (errorData && errorData.detail) {
              if (Array.isArray(errorData.detail)) {
                errorMsg = errorData.detail.map(e => e.msg || 'Unknown error').join(', ');
              } else if (typeof errorData.detail === 'string') {
                errorMsg = errorData.detail;
              }
            }
            setDeleteError(`Validation error: ${errorMsg}`);
            break;
          case 500:
            setDeleteError('Server error. Please try again later.');
            break;
          default:
            setDeleteError(`Error ${err.response.status}: ${err.response.statusText || 'Unknown error'}`);
        }
      } else if (err.request) {
        setDeleteError('Network error. Please check your connection.');
      } else {
        setDeleteError(err.message || 'An error occurred while deleting the user.');
      }
    } finally {
      setDeletingUser(null);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Error formatting date';
    }
  };

  // Truncate user ID for display
  const truncateId = (id) => {
    if (!id) return 'N/A';
    if (id.length <= 8) return id;
    return `${id.substring(0, 8)}...`;
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE) || 1;

  return (
    <div className={styles['users-container']}>
      <div className={styles['users-header']}>
        <h2 className={styles['users-title']}>Users</h2>
        <p className={styles['users-subtitle']}>
          Manage all users in your project. You can view details and delete users.
        </p>
      </div>

      {/* API key form when no API key is available */}
      {!apiKey && (
        <div className={styles['api-key-form-container']}>
          <div className={styles['info-message']}>
            <AlertCircle size={16} />
            <span>
              An API key is required to manage users. Please enter your API key below.
            </span>
          </div>
          
          <form onSubmit={handleApiKeySubmit} className={styles['api-key-form']}>
            <div className={styles['form-group']}>
              <label htmlFor="apiKey" className={styles['form-label']}>API Key</label>
              <input
                type="password"
                id="apiKey"
                name="apiKey"
                className={styles['form-input']}
                placeholder="Enter your API key"
                required
              />
            </div>
            <button type="submit" className={styles['submit-button']}>
              Save API Key
            </button>
          </form>
        </div>
      )}

      {error && (
        <div className={styles['error-message']}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {apiKey && (
        <div className={styles['users-table-container']}>
          {loading ? (
            <div className={styles['loading']}>
              <div className={styles['loading-spinner']}></div>
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className={styles['no-users']}>
              <p>No users found for this project.</p>
            </div>
          ) : (
            <table className={styles['users-table']}>
              <thead>
                <tr>
                  <th 
                    onClick={() => handleSort('user_id')}
                    className={styles['sortable-header']}
                  >
                    User ID {getSortIndicator('user_id')}
                  </th>
                  <th 
                    onClick={() => handleSort('created_at')}
                    className={styles['sortable-header']}
                  >
                    Created At {getSortIndicator('created_at')}
                  </th>
                  <th 
                    onClick={() => handleSort('last_active_at')}
                    className={styles['sortable-header']}
                  >
                    Last Active {getSortIndicator('last_active_at')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id} className={deletingUser === user.user_id ? styles['deleting'] : ''}>
                    <td title={user.user_id}>{truncateId(user.user_id)}</td>
                    <td title={user.created_at}>{formatDate(user.created_at)}</td>
                    <td title={user.last_active_at}>{formatDate(user.last_active_at)}</td>
                    <td>
                      <button 
                        className={styles['delete-button']}
                        onClick={() => openDeleteConfirm(user)}
                        disabled={!!deletingUser}
                        aria-label={`Delete user ${truncateId(user.user_id)}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Pagination */}
      {apiKey && !loading && users.length > 0 && (
        <div className={styles['pagination']}>
          <button 
            className={styles['pagination-button']}
            onClick={goToPreviousPage}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          
          <div className={styles['page-info']}>
            Page {currentPage} of {totalPages || '?'}
            <span className={styles['total-count']}>(Total: {totalUsers})</span>
          </div>
          
          <button 
            className={styles['pagination-button']}
            onClick={goToNextPage}
            disabled={!hasMore || loading}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal - Same as before */}
      {showDeleteConfirm && (
        <div className={styles['modal-overlay']}>
          <div className={styles['delete-modal']}>
            <div className={styles['modal-header']}>
              <h3>Delete User</h3>
              <button
                className={styles['close-button']}
                onClick={closeDeleteConfirm}
                disabled={deletingUser}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            
            <div className={styles['modal-content']}>
              <p>
                Are you sure you want to delete the user with ID: <br />
                <strong>{userToDelete?.user_id}</strong>?
              </p>
              <p className={styles['warning']}>
                <AlertCircle size={16} />
                This action cannot be undone. All data associated with this user will be permanently deleted.
              </p>
              
              {deleteError && (
                <div className={styles['error-message']}>
                  <AlertCircle size={16} />
                  <span>{deleteError}</span>
                </div>
              )}
            </div>
            
            <div className={styles['modal-actions']}>
              <button
                className={styles['cancel-button']}
                onClick={closeDeleteConfirm}
                disabled={!!deletingUser}
              >
                Cancel
              </button>
              
              <button
                className={styles['confirm-delete-button']}
                onClick={handleDeleteUser}
                disabled={!!deletingUser}
              >
                {deletingUser ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;