import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { signInWithGoogle } from '../GoogleAuth';
import styles from './Signup.module.css';

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
    <div className={styles.loginContainer}>
      <div className={styles.loginPanel}>
        <div className={styles.loginContent}>
          <h1>Create account</h1>
          <p>Sign up to get started</p>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <div className={styles.socialLogins}>
            <button className={`${styles.socialButton} ${styles.google}`} onClick={signInWithGoogle}>
              <img src="/google-icon.svg" alt="Google" />
              Sign up with Google
            </button>
          </div>
          
          <div className={styles.divider}>
            <span>OR</span>
          </div>
          
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className={styles.form}>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
              />
              <button 
                type="submit" 
                className={styles.continueButton}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Continue'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className={styles.form}>
              <p className={styles.otpPrompt}>Enter the verification code sent to your email</p>
              {timeRemaining !== null && timeRemaining > 0 && (
                <p className={styles.otpTimer}>Code expires in: {formatTime(timeRemaining)}</p>
              )}
              <input
                type="text"
                placeholder="Verification code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                required
                className={styles.input}
              />
              <button 
                type="submit" 
                className={styles.continueButton}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
              <button 
                type="button" 
                className={styles.resendButton}
                onClick={handleResendOtp}
                disabled={loading || (timeRemaining !== null && timeRemaining > 0)}
              >
                {timeRemaining !== null && timeRemaining > 0 
                  ? `Resend code in ${formatTime(timeRemaining)}`
                  : 'Resend code'}
              </button>
              <button 
                type="button" 
                className={styles.backButton}
                onClick={() => setStep('email')}
              >
                Back
              </button>
            </form>
          )}

          {step === 'userInfo' && (
            <form onSubmit={handleUserInfoSubmit} className={styles.form}>
              <div className={styles.nameFields}>
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className={styles.input}
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className={styles.input}
                />
              </div>
              <div className={styles.passwordField}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={styles.input}
                />
                <button 
                  type="button" 
                  className={styles.togglePassword}
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
                className={styles.input}
              />
              <button 
                type="submit" 
                className={styles.continueButton}
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
              <button 
                type="button" 
                className={styles.backButton}
                onClick={() => setStep('otp')}
              >
                Back
              </button>
            </form>
          )}
          
          <div className={styles.loginLink}>
            <p>Already have an account? <button onClick={handleLoginClick}>Sign in</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;