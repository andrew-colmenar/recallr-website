import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css'; // Reusing the same styles

function Signup() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState('email'); // email -> otp -> userInfo -> complete
  
  const navigate = useNavigate();
  const { signup, verifyOtp, resendOtp, completeSignup } = useAuth();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const response = await signup(email);
      setTransactionId(response.transaction_id);
      setStep('otp');
    } catch (error) {
      console.error('Signup error:', error);
      console.error('Response data:', error.response?.data);
      setError(error.response?.data?.detail || 'Failed to start signup process');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await verifyOtp(transactionId, otpCode);
      setStep('userInfo');
    } catch (error) {
      setError(error.response?.data?.detail || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleUserInfoSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await completeSignup(email, firstName, lastName, password, transactionId);
      navigate('/dashboard'); // Navigate to dashboard after successful signup
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to complete signup');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await resendOtp(transactionId);
      setError('');
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="login-container">
      <div className="login-panel">
        <div className="login-content">
          <h1>Create account</h1>
          <p>Sign up to get started</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="social-logins">
            <button className="social-button google">
              <img src="/google-icon.svg" alt="Google" />
              Sign up with Google
            </button>
            
            <button className="social-button github">
              <img src="/github-icon.svg" alt="GitHub" />
              Sign up with GitHub
            </button>
          </div>
          
          <div className="divider">
            <span>OR</span>
          </div>
          
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit}>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button 
                type="submit" 
                className="continue-button"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Continue'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit}>
              <p>Enter the verification code sent to your email</p>
              <input
                type="text"
                placeholder="Verification code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                required
              />
              <button 
                type="submit" 
                className="continue-button"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
              <button 
                type="button" 
                className="resend-button"
                onClick={handleResendOtp}
                disabled={loading}
              >
                Resend code
              </button>
              <button 
                type="button" 
                className="back-button"
                onClick={() => setStep('email')}
              >
                Back
              </button>
            </form>
          )}

          {step === 'userInfo' && (
            <form onSubmit={handleUserInfoSubmit}>
              <div className="name-fields">
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button 
                type="submit" 
                className="continue-button"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
              <button 
                type="button" 
                className="back-button"
                onClick={() => setStep('otp')}
              >
                Back
              </button>
            </form>
          )}
          
          <div className="login-link">
            <p>Already have an account? <button onClick={handleLoginClick}>Sign in</button></p>
          </div>
        </div>
      </div>
      <div className="dashboard-preview">
        {/* Dashboard preview content - optional */}
      </div>
    </div>
  );
}

export default Signup;