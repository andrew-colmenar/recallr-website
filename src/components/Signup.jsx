import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css'; // Reusing the same styles
import { signInWithGoogle } from './GoogleAuth'

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
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  
  const navigate = useNavigate();
  const { signup, verifyOtp, resendOtp, completeSignup } = useAuth();

  useEffect(() => {
    let timer;
    if (otpExpiresAt) {
      timer = setInterval(() => {
        const expiryTime = new Date(otpExpiresAt).getTime();
        const currentTime = new Date().getTime();
        const remaining = Math.max(0, Math.floor((expiryTime - currentTime) / 1000));
        
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [otpExpiresAt]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const response = await signup(email);
      setTransactionId(response.transaction_id);
      
      // Set OTP expiration time from API response
      if (response.otp_expires_at) {
        setOtpExpiresAt(response.otp_expires_at);
      }
      
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
      const response = await resendOtp(transactionId);
      
      // Update OTP expiration time after resend
      if (response && response.otp_expires_at) {
        setOtpExpiresAt(response.otp_expires_at);
      }
      
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

  // Format remaining time as MM:SS
  const formatTime = (seconds) => {
    if (seconds === null) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="login-container">
      <div className="login-panel">
        <div className="login-content">
          <h1>Create account</h1>
          <p>Sign up to get started</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="social-logins">
            <button className="social-button google" onClick={signInWithGoogle}>
              <img src="/google-icon.svg" alt="Google" />
              Sign up with Google
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
              {timeRemaining !== null && timeRemaining > 0 && (
                <p className="otp-timer">Code expires in: {formatTime(timeRemaining)}</p>
              )}
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
                disabled={loading || (timeRemaining !== null && timeRemaining > 0)}
              >
                {timeRemaining !== null && timeRemaining > 0 
                  ? `Resend code in ${formatTime(timeRemaining)}`
                  : 'Resend code'}
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
    </div>
  );
}

export default Signup;