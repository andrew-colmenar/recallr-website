import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService'; 
import '../../styles/Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessions = await authService.getAllSessions();
        setActiveSessions(sessions || []);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleRevokeSession = async (userId, sessionId) => {
    try {
      await authService.revokeSession(userId, sessionId);
      // Refresh the sessions list
      const sessions = await authService.getAllSessions();
      setActiveSessions(sessions || []);
    } catch (error) {
      console.error('Failed to revoke session:', error);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.first_name || 'User'}</h1>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
      
      <div className="dashboard-content">
        <div className="user-info">
          <h2>Your Profile</h2>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Name:</strong> {user?.first_name} {user?.last_name}</p>
        </div>
        
        <div className="sessions-section">
          <h2>Active Sessions</h2>
          {activeSessions.length > 0 ? (
            <div className="sessions-list">
              {activeSessions.map((session) => (
                <div key={session.session_id} className="session-item">
                  <div className="session-info">
                    <p><strong>Device:</strong> {session.device_info?.device_type}</p>
                    <p><strong>Last Active:</strong> {new Date(session.last_active_at).toLocaleString()}</p>
                  </div>
                  <button 
                    className="revoke-button"
                    onClick={() => handleRevokeSession(session.user_id, session.session_id)}
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No active sessions found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;