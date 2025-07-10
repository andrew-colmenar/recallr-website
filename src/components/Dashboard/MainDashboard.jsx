import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar/Sidebar";
import styles from "./Dashboard.module.css";
import { useNavigate } from "react-router-dom";
import { useProjectContext } from "../../context/ProjectContext";
import ProjectModal from "./Projects/ProjectModal";
import { Key, DollarSign, Box } from "lucide-react";
import { appApi } from "../../api/axios";
import Cookies from "js-cookie";

const MainDashboard = () => {
  const { currentProjectId, setCurrentProjectId } = useProjectContext();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch balance when component mounts
  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    setBalanceLoading(true);
    try {
      const user_id = Cookies.get('user_id');
      const session_id = Cookies.get('session_id');

      if (!user_id || !session_id) {
        throw new Error('Authentication required');
      }

      const response = await appApi.get('/billing/balance', {
        headers: {
          'X-User-Id': user_id,
          'X-Session-Id': session_id
        }
      });

      setBalance(response.data);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      // Set default balance on error
      setBalance({ balance: 0, currency: 'usd' });
    } finally {
      setBalanceLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(parseFloat(amount));
  };

  if (!currentProjectId) {
    return (
      <div className={styles.mainContainer}>
        <Sidebar projectId="" />
        <div className={styles.contentContainer}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", gap: "2.5rem" }}>
            {/* Create New Project */}
            <div
              style={{
                background: "#1F2937",
                borderRadius: 16,
                boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                padding: "2.5rem 2.2rem",
                minWidth: 260,
                textAlign: "center",
                cursor: "pointer",
                border: "2px solid #3B82F6",
                transition: "transform 0.15s",
              }}
              onClick={() => navigate("/dashboard/projects")}
            >
              <h2 style={{ fontSize: "1.3rem", marginBottom: 12 }}>Create New Project</h2>
              <p style={{ color: "#9CA3AF", fontSize: 15 }}>Start fresh with a new project.</p>
            </div>
            {/* Select Existing Project */}
            <div
              style={{
                background: "#1F2937",
                borderRadius: 16,
                boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                padding: "2.5rem 2.2rem",
                minWidth: 260,
                textAlign: "center",
                cursor: "pointer",
                border: "2px solid #A855F7",
                transition: "transform 0.15s",
              }}
              onClick={() => setIsProjectModalOpen(true)}
            >
              <h2 style={{ fontSize: "1.3rem", marginBottom: 12 }}>Select Existing Project</h2>
              <p style={{ color: "#9CA3AF", fontSize: 15 }}>Choose from your existing projects.</p>
            </div>
            {/* Navigate to Get Started */}
            <div
              style={{
                background: "#1F2937",
                borderRadius: 16,
                boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                padding: "2.5rem 2.2rem",
                minWidth: 260,
                textAlign: "center",
                cursor: "pointer",
                border: "2px solid #F59E42",
                transition: "transform 0.15s",
              }}
              onClick={() => navigate("/getstarted")}
            >
              <h2 style={{ fontSize: "1.3rem", marginBottom: 12 }}>Get Started with SDK</h2>
              <p style={{ color: "#9CA3AF", fontSize: 15 }}>View the SDK quick start guide.</p>
            </div>
          </div>
          <ProjectModal
            isOpen={isProjectModalOpen}
            onClose={() => setIsProjectModalOpen(false)}
            onProjectSelect={(project) => {
              setCurrentProjectId(project.id);
              setIsProjectModalOpen(false);
            }}
            currentProjectId={currentProjectId}
          />
        </div>
      </div>
    );
  }

  // Normal dashboard content if a project is selected
  return (
    <div className={styles.mainContainer}>
      <Sidebar projectId={currentProjectId} />
      <div className={styles.contentContainer}>
        <div style={{ padding: "2rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "2rem", color: "var(--text-primary)" }}>Dashboard</h1>
          
          <div style={{ 
            display: "flex", 
            flexDirection: "column",
            gap: "2rem",
            maxWidth: "1200px",
            margin: "0 auto"
          }}>
            {/* First row - 2 boxes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
              {/* API Keys Box */}
              <div
                style={{
                  background: "#374151",
                  borderRadius: 16,
                  padding: "2rem",
                  textAlign: "center",
                  border: "1px solid #4B5563",
                  minHeight: "200px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Key size={48} style={{ color: "#60A5FA", marginBottom: "1rem" }} />
                  <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "var(--text-primary)" }}>API Keys</h2>
                  <p style={{ color: "#9CA3AF", fontSize: "0.9rem" }}>Manage your project API keys</p>
                </div>
                <button
                  onClick={() => navigate(`/dashboard/apikeys?project=${currentProjectId}`)}
                  style={{
                    background: "#60A5FA",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.75rem 1.5rem",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    marginTop: "1rem"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#3B82F6"}
                  onMouseLeave={(e) => e.target.style.background = "#60A5FA"}
                >
                  Manage Keys
                </button>
              </div>

              {/* Balance Box */}
              <div
                style={{
                  background: "#374151",
                  borderRadius: 16,
                  padding: "2rem",
                  textAlign: "center",
                  border: "1px solid #4B5563",
                  minHeight: "200px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <DollarSign size={48} style={{ color: "#34D399", marginBottom: "1rem" }} />
                  <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "var(--text-primary)" }}>Account Balance</h2>
                  {balanceLoading ? (
                    <p style={{ color: "#9CA3AF", fontSize: "0.9rem" }}>Loading...</p>
                  ) : (
                    <div>
                      <p style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#34D399", marginBottom: "0.5rem" }}>
                        {formatCurrency(balance?.balance || 0, balance?.currency || 'usd')}
                      </p>
                      <p style={{ color: "#9CA3AF", fontSize: "0.9rem" }}>
                        x-credits
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate('/dashboard/payment')}
                  style={{
                    background: "#34D399",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.75rem 1.5rem",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    marginTop: "1rem"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#10B981"}
                  onMouseLeave={(e) => e.target.style.background = "#34D399"}
                >
                  Add Funds
                </button>
              </div>
            </div>

            {/* Second row - Analytics Box */}
            <div
              style={{
                background: "#374151",
                borderRadius: 16,
                padding: "2rem",
                textAlign: "center",
                border: "1px solid #4B5563",
                minHeight: "150px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Box size={48} style={{ color: "#F59E0B", marginBottom: "1rem" }} />
                <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "var(--text-primary)" }}>Analytics</h2>
                <p style={{ color: "#9CA3AF", fontSize: "0.9rem" }}>Coming soon - detailed insights and metrics</p>
              </div>
              <button
                style={{
                  background: "#F59E0B",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.75rem 1.5rem",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  cursor: "not-allowed",
                  opacity: "0.6",
                  marginTop: "1rem"
                }}
                disabled
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard; 