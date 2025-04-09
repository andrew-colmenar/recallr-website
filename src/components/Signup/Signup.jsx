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

  // Add this effect to persist the transaction ID
  useEffect(() => {
    // Store transaction ID in session storage when it changes
    if (transactionId) {
      sessionStorage.setItem('signupTransactionId', transactionId);
      console.log("Transaction ID saved to session storage:", transactionId);
    }
  }, [transactionId]);

  // Then in your component initialization, check if there's a saved transaction ID
  useEffect(() => {
    const savedTransactionId = sessionStorage.getItem('signupTransactionId');
    if (savedTransactionId && !transactionId) {
      console.log("Restored transaction ID from session storage:", savedTransactionId);
      setTransactionId(savedTransactionId);
    }
  }, []);

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
      navigate('/getstarted'); 
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to complete signup');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Clear any previous error
      console.log("Resending OTP with transaction ID:", transactionId);
      
      // Make sure the transaction ID is valid before proceeding
      if (!transactionId) {
        const savedTransactionId = sessionStorage.getItem('signupTransactionId');
        if (savedTransactionId) {
          console.log("Using saved transaction ID from session storage:", savedTransactionId);
          setTransactionId(savedTransactionId);
          
          // Wait for state update to take effect before proceeding
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Now use the retrieved transaction ID
          const response = await resendOtp(savedTransactionId);
          console.log("Resend OTP response:", response);
          
          if (response && response.otp_expires_at) {
            setOtpExpiresAt(response.otp_expires_at);
          }
          
          // Update transaction ID if a new one is provided
          if (response && response.transaction_id) {
            setTransactionId(response.transaction_id);
          }
        } else {
          throw new Error("No transaction ID available");
        }
      } else {
        // Use the existing transaction ID
        const response = await resendOtp(transactionId);
        console.log("Resend OTP response:", response);
        
        if (response && response.otp_expires_at) {
          setOtpExpiresAt(response.otp_expires_at);
        }
        
        // Update transaction ID if a new one is provided
        if (response && response.transaction_id) {
          setTransactionId(response.transaction_id);
        }
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setError(error.response?.data?.detail || 'Failed to resend verification code');
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

  // Determine the step title and description based on current step
  const getStepHeader = () => {
    switch(step) {
      case 'email':
        return { title: 'Join Recallr AI', description: 'Create your account to get started' };
      case 'otp':
        return { title: 'Verify Email', description: '' };
      case 'userInfo':
        return { title: 'Complete Profile', description: 'Just a few more details to get you set up' };
      default:
        return { title: 'Join Recallr AI', description: 'Create your account to get started' };
    }
  };

  const header = getStepHeader();

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginPanel}>
        <div className={styles.loginContent}>
          <h1>{header.title}</h1>
          <p>{header.description}</p>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          {/* Email Step */}
          {step === 'email' && (
            <div className={styles.stepContainer}>
              <div className={styles.socialLogins}>
                <button className={`${styles.socialButton} ${styles.google}`} onClick={signInWithGoogle}>
                  <img src="/google-icon.svg" alt="Google" />
                  Continue with Google
                </button>
              </div>
              
              <div className={styles.divider}>
                <span>OR</span>
              </div>
              
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
                  {loading ? 'Processing...' : 'Continue'}
                </button>
              </form>
            </div>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <div className={styles.stepContainer}>
              <form onSubmit={handleOtpSubmit} className={styles.form}>
                <p className={styles.otpPrompt}>
                  Enter the code sent to <span className={styles.emailHighlight}>{email}</span>
                </p>
                {timeRemaining !== null && timeRemaining > 0 && (
                  <p className={styles.otpTimer}>Code expires in: {formatTime(timeRemaining)}</p>
                )}
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
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
                  {loading ? 'Verifying...' : 'Verify Code'}
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
            </div>
          )}

          {/* User Info Step */}
          {step === 'userInfo' && (
            <div className={styles.stepContainer}>
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
                    placeholder="Create password"
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
                <div className={styles.passwordField}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={styles.input}
                  />
                </div>
                <button 
                  type="submit" 
                  className={styles.continueButton}
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
                <button 
                  type="button" 
                  className={styles.backButton}
                  onClick={() => setStep('otp')}
                >
                  Back
                </button>
              </form>
            </div>
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