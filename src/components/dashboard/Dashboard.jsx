import React, { useEffect, useState } from "react";
import { Routes, Route, useSearchParams, useNavigate, Navigate } from "react-router-dom";
import { appApi } from "../../api/axios";
import Cookies from 'js-cookie';
import Sidebar from "./Sidebar/Sidebar";
import RequestsDashboard from "./RequestsDashboard";
import ComingSoon from "../ComingSoon/ComingSoon";
import Billing from "../Billing/Billing";
import styles from "./Dashboard.module.css";
import APIKeys from "./APIKeys/APIKeys";
import ProjectSettings from "./Settings/ProjectSettings";

// Default project to use when no project ID is specified or on error
const DEFAULT_PROJECT = {
  id: "default-id",
  name: "Default Project",
  description: "Default project for new users",
  recall_preferences: {
    classifier: {
      custom_instructions: [],
      false_positive_examples: [],
      false_negative_examples: []
    },
    subquery_and_keywords_generator: {
      custom_instructions: [],
      subqueries_candidate_nodes_weight: 0,
      example_subqueries: [],
      keywords_candidate_nodes_weight: 0,
      example_keywords: []
    }
  },
  generation_preferences: {
    custom_instructions: [],
    top_k_symantic_similarity_check: 0,
    raise_merge_conflict: false
  },
  created_at: new Date().toISOString()
};

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [currentProject, setCurrentProject] = useState(DEFAULT_PROJECT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  
  const projectId = searchParams.get('project');
  
  // First, fetch all projects to determine if user has any
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const user_id = Cookies.get('user_id');
        const session_id = Cookies.get('session_id');
        
        if (!user_id || !session_id) {
          throw new Error('Authentication required');
        }
        
        const response = await appApi.get('projects', {
          headers: {
            'X-User-Id': user_id,
            'X-Session-Id': session_id
          },
          params: {
            offset: 0,
            limit: 100
          }
        });
        
        const { projects: projectsList } = response.data;
        
        setProjects(projectsList || []);
        
        // If no project is selected in URL but user has projects, redirect to latest project
        if (!projectId && projectsList && projectsList.length > 0) {
          // Sort by creation date (newest first) and redirect to settings
          const sortedProjects = [...projectsList].sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          );
          
          navigate(`/dashboard/settings?project=${sortedProjects[0].id}`, { replace: true });
          return;
        }
        
        // If no projects exist and no project is selected, use default project and go to settings
        if ((!projectsList || projectsList.length === 0) && !projectId) {
          navigate(`/dashboard/settings?project=${DEFAULT_PROJECT.id}`, { replace: true });
          return;
        }
        
      } catch (error) {
        console.error('Error fetching projects:', error);
        // In case of error, we'll continue with project details fetching
      }
    };
    
    fetchProjects();
  }, []);
  
  useEffect(() => {
    const fetchProjectDetails = async () => {
      // If no project is selected, use default
      if (!projectId) {
        setCurrentProject(DEFAULT_PROJECT);
        setLoading(false);
        return;
      }
      
      // Otherwise fetch the specific project
      try {
        const user_id = Cookies.get('user_id');
        const session_id = Cookies.get('session_id');
        
        if (!user_id || !session_id) {
          throw new Error('Authentication required');
        }
        
        const response = await appApi.get(`projects/${projectId}`, {
          headers: {
            'X-User-Id': user_id,
            'X-Session-Id': session_id
          }
        });
        
        setCurrentProject(response.data);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Error fetching project details:', err);
        
        // Handle different error responses
        if (err.response) {
          switch (err.response.status) {
            case 400:
              setError('Bad request. Please check your request parameters.');
              break;
            case 401:
              setError('Authentication required. Please log in again.');
              setTimeout(() => navigate('/login'), 2000);
              break;
            case 403:
              setError('You don\'t have access to this project or subscription required.');
              break;
            case 404:
              setError(`Project not found: ${projectId}`);
              // Redirect to dashboard with default project ID after showing error
              setTimeout(() => navigate(`/dashboard/settings?project=${DEFAULT_PROJECT.id}`), 2000);
              break;
            case 422:
              const validationErrors = err.response.data.detail;
              setError(`Validation error: ${validationErrors?.[0]?.msg || 'Please check your request.'}`);
              break;
            case 500:
              setError('Server error. Please try again later.');
              break;
            default:
              setError(`Error: ${err.response.status} - ${err.response.statusText}`);
          }
        } else if (err.request) {
          setError('Network error. Please check your connection.');
        } else {
          setError(err.message || 'An error occurred while loading the project.');
        }
        
        // Use the default project on error
        setCurrentProject(DEFAULT_PROJECT);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectDetails();
  }, [projectId, navigate]);

  if (loading) {
    return <div className={styles.loadingContainer}>Loading project...</div>;
  }

  return (
    <div className={styles.mainContainer}>
      <Sidebar projectId={projectId || DEFAULT_PROJECT.id} />
      <div className={styles.contentContainer}>
        {error && (
          <div className={styles.errorBanner}>
            {error}
          </div>
        )}
        <main className={styles.main}>
          <Routes>
            <Route index element={<Navigate to={`settings?project=${projectId || DEFAULT_PROJECT.id}`} replace />} />
            <Route path="usage" element={<ComingSoon project={currentProject} />} />
            <Route path="users" element={<ComingSoon project={currentProject} />} />
            <Route path="apikeys" element={<APIKeys project={currentProject} />} />
            <Route path="settings" element={<ProjectSettings project={currentProject} />} />
            <Route path="*" element={<ComingSoon project={currentProject} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
