import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login/Login"; // Updated import path
import Signup from "./components/Signup/Signup";
import Dashboard from "./components/dashboard/Dashboard";
import SessionsManager from "./components/SessionsManager";
import Billing from "./components/Billing/Billing";
import ComingSoon from "./components/ComingSoon/ComingSoon";
import "./App.css";
import authService from "./services/authService";
import CreateProject from "./components/CreateProject/CreateProject";
import Header from "./components/Header/Header";

// Main app content with routes
function AppContent() {
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
    <>
      {sessionValid && <Header />}
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
          path="/CreateProject" 
          element={
            <ProtectedRoute isValid={sessionValid}>
              <CreateProject />
            </ProtectedRoute>
          } 
        />
        <Route path="/usage" element={<Navigate to="/dashboard/usage" />} />
        <Route path="/users" element={<Navigate to="/dashboard/users" />} />
        <Route path="/apikeys" element={<Navigate to="/dashboard/apikeys" />} />
        <Route path="/settings" element={<Navigate to="/dashboard/settings" />} />
        <Route path="/billing" element={<Navigate to="/dashboard/billing" />} />
        <Route path="/getstarted" element={<Navigate to="/dashboard/getstarted" />} />
        <Route 
          path="/status" 
          element={
            <ProtectedRoute isValid={sessionValid}>
              <ComingSoon />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/playground" 
          element={
            <ProtectedRoute isValid={sessionValid}>
              <ComingSoon />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/docs" 
          element={
            <ProtectedRoute isValid={sessionValid}>
              <ComingSoon />
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
    </>
  );
}

// Main App component
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;