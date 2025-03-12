import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import Cookies from 'js-cookie';
import styles from './ProjectModal.module.css';

const getSessionFromCookies = () => {
  return {
    user_id: Cookies.get('user_id'),
    session_id: Cookies.get('session_id'),
  };
};

const ProjectModal = ({ isOpen, onClose, onProjectSelect }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);
  
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { user_id, session_id } = getSessionFromCookies();
      
      if (!user_id || !session_id) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      const response = await api.get('/api/v1/projects', {
        params: { user_id, session_id }
      });
      
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setError('Bad request. Please try again.');
            break;
          case 401:
            setError('Authentication required. Please log in again.');
            // Redirect to login after a delay
            setTimeout(() => navigate('/login'), 2000);
            break;
          case 403:
            setError('Subscription required to access projects.');
            break;
          case 422:
            const validationErrors = error.response.data.detail;
            setError(`Validation error: ${validationErrors?.[0]?.msg || 'Please check your request.'}`);
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError('An error occurred. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleProjectSelect = (project) => {
    if (onProjectSelect) {
      onProjectSelect(project);
    }
    onClose();
  };
  
  const handleCreateProject = () => {
    navigate('/create-project');
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Select Project</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        
        <div className={styles.modalBody}>
          {error && (
            <div className={styles.errorMessage}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          
          {loading ? (
            <div className={styles.loadingIndicator}>
              <div className={styles.spinner}></div>
              <span>Loading projects...</span>
            </div>
          ) : projects.length > 0 ? (
            <div className={styles.projectList}>
              {projects.map(project => (
                <div 
                  key={project.id} 
                  className={styles.projectItem}
                  onClick={() => handleProjectSelect(project)}
                >
                  <div className={styles.projectInfo}>
                    <h3 className={styles.projectName}>{project.name}</h3>
                    <p className={styles.projectId}>ID: {project.id}</p>
                    {project.description && (
                      <p className={styles.projectDescription}>{project.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <AlertCircle size={32} />
              </div>
              <h3>No Projects Found</h3>
              <p>You haven't created any projects yet. Create a new project to get started.</p>
            </div>
          )}
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.createButton} onClick={handleCreateProject}>
            <Plus size={16} />
            <span>Create New Project</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;