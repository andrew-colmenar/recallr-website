import React, { useState } from 'react';
import styles from './APIKeys.module.css'; // You'll need to create this CSS module

const APIKeys = () => {
  // Sample data - replace with actual data in your implementation
  const [apiKeys, setApiKeys] = useState([
    { 
      name: "Rohan", 
      key: "m0-*****SBgC", 
      createdAt: "3:27:49 AM, Mar 11, 2025" 
    },
    { 
      name: "rohan0-playground-key", 
      key: "m0-*****HZp0", 
      createdAt: "2:42:38 AM, Jan 6, 2025" 
    }
  ]);
  
  const projectId = "default-project"; // This would come from your actual project data

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>API Keys</h1>
          <div className={styles.projectId}>
            Project ID: <span className={styles.mono}>{projectId}</span>
          </div>
        </div>
        
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.headerCell}>Name</th>
                <th className={styles.headerCell}>API Key</th>
                <th className={styles.headerCell}>Created At</th>
                <th className={styles.headerCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((keyItem, index) => (
                <tr key={index} className={styles.tableRow}>
                  <td className={styles.cell}>{keyItem.name}</td>
                  <td className={styles.cell}>
                    <div className={styles.keyContainer}>
                      <span className={styles.mono}>{keyItem.key}</span>
                      <button className={styles.iconButton}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className={styles.cell}>{keyItem.createdAt}</td>
                  <td className={styles.cell}>
                    <button className={styles.iconButton}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <button className={styles.createButton}>
          Create API Key
        </button>
      </div>
    </div>
  );
};

export default APIKeys;