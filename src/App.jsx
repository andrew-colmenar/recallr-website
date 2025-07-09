import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useSearchParams,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import Dashboard from "./components/Dashboard/Dashboard";
import MainDashboard from "./components/Dashboard/MainDashboard";
// import ComingSoon from "./components/ComingSoon/ComingSoon";
// import Billing from "./components/Billing/Main/Billing";
import "./App.css";
import authService from "./services/authService";
import Header from "./components/Header/Header";
import GetStarted from "./components/GetStarted/GetStarted";
import ContactHelp from "./components/ContactHelp";
import ProjectManagement from "./components/Dashboard/Projects/ProjectManagement";

// Custom loading component with updated styling
const LoadingScreen = () => (
  <div className="app-loading">
    <div className="loading-spinner"></div>
    <p>Loading Recallr AI</p>
  </div>
);

// Main app content with routes
function AppContent() {
  const { isAuthenticated, loading } = useAuth();
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
    return <LoadingScreen />;
  }

  return (
    <div className="app-container">
      {sessionValid && <Header />}
      <main className="app-main">
        <Routes>
          {/* Public routes - accessible when not logged in */}
          <Route 
            path="/login" 
            element={sessionValid ? <Navigate to="/dashboard/main" /> : <Login />} 
          />
          <Route 
            path="/signup" 
            element={sessionValid ? <Navigate to="/dashboard/main" /> : <Signup />} 
          />

          {/* Protected routes - require authentication */}
          <Route 
            path="/dashboard/*" 
            element={sessionValid ?  <Dashboard/>: <Navigate to="/login" />} 
          />
          <Route 
            path="/dashboard/main" 
            element={sessionValid ? <MainDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/dashboard/projects" 
            element={<ProjectManagement />} 
          />

          {/* Non-project specific routes */}
          {/* <Route 
            path="/billing" 
            element={sessionValid ?  <Billing/>: <Navigate to="/login" />} 
          />

          {/* <Route           
            path="/usage"           
            element={
              <ProtectedRoute isValid={sessionValid}>
                <ComingSoon />
              </ProtectedRoute>
            } 
          /> */}
          {/* <Route 
            path="/playground" 
            element={
              <ProtectedRoute isValid={sessionValid}>
                <ComingSoon />
              </ProtectedRoute>
            } 
          /> */}
          {/* <Route 
            path="/docs" 
            element={
              <ProtectedRoute isValid={sessionValid}>
                <ComingSoon />
              </ProtectedRoute>
            } 
          /> */}
          <Route 
            path="/getstarted" 
            element={   
              <GetStarted />
            } 
          />
          <Route 
            path="/contact-help" 
            element={<ContactHelp />} 
          />

          {/* Redirect from root to dashboard */}
          <Route
            path="/"
            element={
              sessionValid ? <Navigate to="/dashboard/main" /> : <Navigate to="/login" />
            }
          />

          {/* 404 route - handle unmatched routes */}
          <Route 
            path="*" 
            element={
              <Navigate to={sessionValid ? "/dashboard/main" : "/login"} />
            } 
          />
        </Routes>
      </main>
    </div>
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
