import { useState, useEffect } from 'react';
import authService from '../services/authService';
import '../styles/SessionsManager.css';

function SessionsManager() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const sessionsData = await authService.getAllSessions();
      setSessions(sessionsData || []);
      setError('');
    } catch (error) {
      setError('Failed to load sessions. Please try again.');
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (userId, sessionId) => {
    try {
      await authService.revokeSession(userId, sessionId);
      // Remove the revoked session from the list
      setSessions(prevSessions => 
        prevSessions.filter(session => session.session_id !== sessionId)
      );
    } catch (error) {
      setError('Failed to revoke session. Please try again.');
      console.error('Error revoking session:', error);
    }
  };

  if (loading) {
    return <div className="sessions-loading">Loading sessions...</div>;
  }

  return (
    <div className="sessions-manager">
      <div className="sessions-header">
        <h2>Manage Your Sessions</h2>
        <button onClick={fetchSessions} className="refresh-button">
          Refresh
        </button>
      </div>
      
      {error && <div className="sessions-error">{error}</div>}
      
      {sessions.length === 0 ? (
        <div className="no-sessions">No active sessions found.</div>
      ) : (
        <div className="sessions-list">
          <div className="sessions-table-header">
            <div className="column device">Device</div>
            <div className="column browser">Browser</div>
            <div className="column location">Location</div>
            <div className="column last-active">Last Active</div>
            <div className="column actions">Actions</div>
          </div>
          
          {sessions.map(session => {
            const isCurrentSession = session.current || false;
            
            return (
              <div key={session.session_id} className={`session-row ${isCurrentSession ? 'current-session' : ''}`}>
                <div className="column device">
                  {session.device_info?.device_type || 'Unknown device'}
                  {isCurrentSession && <span className="current-badge">Current</span>}
                </div>
                <div className="column browser">
                  {session.device_info?.browser_name || 'Unknown'}
                </div>
                <div className="column location">
                  {session.location || 'Unknown'}
                </div>
                <div className="column last-active">
                  {new Date(session.last_active_at).toLocaleString()}
                </div>
                <div className="column actions">
                  <button 
                    onClick={() => handleRevokeSession(session.user_id, session.session_id)}
                    className="revoke-button"
                    disabled={isCurrentSession}
                    title={isCurrentSession ? "Can't revoke current session" : "Revoke this session"}
                  >
                    {isCurrentSession ? 'Current' : 'Revoke'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SessionsManager;