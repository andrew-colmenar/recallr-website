import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/dashboard/Dashboard";
import SessionsManager from "./components/SessionsManager";
import Billing from "./components/Billing/Billing";
import "./App.css";
import authService from "./services/authService";

// Main app content with routes
function AppRoutes() {
  const { user, isAuthenticated, loading } = useAuth();
  const [sessionValid, setSessionValid] = useState(null);
  const [validatingSession, setValidatingSession] = useState(true);

  // Validate session when app loads
  useEffect(() => {
    const checkSessionValidity = async () => {
      if (isAuthenticated) {
        try {
          setValidatingSession(true);
          const valid = await authService.validateSession();
          setSessionValid(valid);
        } catch (error) {
          console.error("Session validation error:", error);
          setSessionValid(false);
        } finally {
          setValidatingSession(false);
        }
      } else {
        setSessionValid(false);
        setValidatingSession(false);
      }
    };

    checkSessionValidity();
  }, [isAuthenticated]);

  // Show loading while checking authentication and session
  if (loading || validatingSession) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <Routes>
      {/* Public routes - accessible when not logged in */}
      <Route 
        path="/login" 
        element={sessionValid ? <Navigate to="/dashboard" /> : <Login />} 
      />
      <Route 
        path="/signup" 
        element={sessionValid ? <Navigate to="/dashboard" /> : <Signup />} 
      />
      
      {/* Protected routes - require authentication */}
      <Route 
        path="/dashboard/*" 
        element={
          <ProtectedRoute isValid={sessionValid}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/sessions" 
        element={
          <ProtectedRoute isValid={sessionValid}>
            <SessionsManager />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/billing" 
        element={
          <ProtectedRoute isValid={sessionValid}>
            <Billing />
          </ProtectedRoute>
        } 
      />
      
      {/* Redirect from root to dashboard or login */}
      <Route 
        path="/" 
        element={
          sessionValid ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        } 
      />
      
      {/* 404 route - handle unmatched routes */}
      <Route 
        path="*" 
        element={
          <Navigate to={sessionValid ? "/dashboard" : "/login"} />
        } 
      />
    </Routes>
  );
}

// Main App component
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;