// UsersInterface.jsx
import React, { useState } from 'react';
import styles from './Users.module.css';

const Users = () => {
  // Sample user data
  const [users, setUsers] = useState([
    {
      user_id: "user_123456",
      created_at: "Jan 6, 2025, 2:42:39 AM",
      last_active_at: "Jan 15, 2025, 4:15:22 PM"
    },
    {
      user_id: "user_789012",
      created_at: "Feb 12, 2025, 10:30:15 AM",
      last_active_at: "Mar 1, 2025, 9:22:08 AM"
    },
    {
      user_id: "user_345678",
      created_at: "Dec 22, 2024, 8:05:51 PM",
      last_active_at: "Mar 10, 2025, 11:45:30 AM"
    }
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIndicator = (field) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? '↑' : '↓';
    }
    return '';
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    // Assuming there's more data beyond what we have
    setCurrentPage(currentPage + 1);
  };

  return (
    <div className={styles['users-container']}>
      <div className={styles['users-header']}>
        <h2 className={styles['users-title']}>Users</h2>
        <p className={styles['users-subtitle']}>Here's a list of all users, agents, apps, and sessions in your account.</p>
      </div>

      <div className={styles['users-table-container']}>
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
                Last Active At {getSortIndicator('last_active_at')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index}>
                <td>{user.user_id}</td>
                <td>{user.created_at}</td>
                <td>{user.last_active_at}</td>
                <td>
                  <button className={styles['delete-button']}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles['pagination']}>
        <button 
          className={styles['pagination-button']}
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Previous
        </button>
        
        <div className={styles['page-number']}>
          Page {currentPage}
        </div>
        
        <button 
          className={styles['pagination-button']}
          onClick={goToNextPage}
        >
          Next
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Users;