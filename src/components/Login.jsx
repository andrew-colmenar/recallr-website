import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';
import { signInWithGoogle } from './GoogleSignin'

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState('email'); // email -> password -> otp -> complete
  
  const navigate = useNavigate();
  const { login, completeLogin, verifyOtp, resendOtp } = useAuth();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      // Move to password step
      setStep('password');
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to submit email');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const response = await login(email, password);
      setTransactionId(response.transaction_id);
      setStep('otp');
    } catch (error) {
      setError(error.response?.data?.detail || 'Login failed. Please check your credentials.');
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
      await completeLogin(transactionId);
      navigate('/dashboard'); // Navigate to dashboard after successful login
    } catch (error) {
      setError(error.response?.data?.detail || 'Invalid OTP code');
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

  const handleSignupClick = () => {
    navigate('/signup');
  };

  return (
    <div className="login-container">
      <div className="login-panel">
        <div className="login-content">
          <h1>Welcome back!</h1>
          <p>Sign in to your account</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="social-logins">
            <button className="social-button google" onClick={signInWithGoogle}>
              <img src="/google-icon.svg" alt="Google" />
              Sign in with Google
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

          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit}>
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
              <button 
                type="submit" 
                className="continue-button"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Login'}
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

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit}>
              <p className="otp-prompt">Enter the verification code sent to your email</p>
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
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button 
                type="button" 
                className="resend-button"
                onClick={handleResendOtp}
                disabled={loading}
              >
                Resend code
              </button>
            </form>
          )}
          
          <div className="signup-link">
            <p>Don't have an account? <button onClick={handleSignupClick}>Sign up</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;