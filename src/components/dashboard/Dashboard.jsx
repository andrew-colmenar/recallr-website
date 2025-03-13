import React, { useEffect, useState } from "react";
import { Routes, Route, useSearchParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Cookies from 'js-cookie';
import Sidebar from "./Sidebar/Sidebar";
import RequestsDashboard from "./RequestsDashboard";
import ComingSoon from "../ComingSoon/ComingSoon";
import Billing from "../Billing/Billing";
import styles from "./Dashboard.module.css";
import APIKeys from "./APIKeys/APIKeys";

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
  const navigate = useNavigate();
  
  const projectId = searchParams.get('project');
  
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
        
        const response = await api.get(`app/projects/${projectId}`, {
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
              // Redirect to dashboard with no project ID after showing error
              setTimeout(() => navigate('/dashboard'), 2000);
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
      <Sidebar />
      <div className={styles.contentContainer}>
        {error && (
          <div className={styles.errorBanner}>
            {error}
          </div>
        )}
        <main className={styles.main}>
          <Routes>
            <Route index element={<RequestsDashboard project={currentProject} />} />
            <Route path="usage" element={<ComingSoon project={currentProject} />} />
            <Route path="users" element={<ComingSoon project={currentProject} />} />
            <Route path="apikeys" element={<APIKeys project={currentProject} />} />
            <Route path="settings" element={<ComingSoon project={currentProject} />} />
            <Route path="billing" element={<Billing project={currentProject} />} />
            <Route path="getstarted" element={<ComingSoon project={currentProject} />} />
            <Route path="status" element={<ComingSoon project={currentProject} />} />
            <Route path="playground" element={<ComingSoon project={currentProject} />} />
            <Route path="docs" element={<ComingSoon project={currentProject} />} />
            <Route path="*" element={<ComingSoon project={currentProject} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
