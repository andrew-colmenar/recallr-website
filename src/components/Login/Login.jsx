import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Login.module.css";
import { signInWithGoogle } from "../GoogleAuth"; // Add this import

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState('email'); // email -> password -> otp -> complete
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  // New state for reset password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const navigate = useNavigate();
  const { 
    login, 
    completeLogin, 
    verifyOtp, 
    resendOtp,
    requestPasswordReset,
    completePasswordReset 
  } = useAuth();

  // Existing timer effect
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

  // Existing methods
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setStep('password');
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to submit email");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const response = await login(email, password);
      setTransactionId(response.transaction_id);
      
      if (response.otp_expires_at) {
        setOtpExpiresAt(response.otp_expires_at);
      }

      setStep("otp");
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await verifyOtp(transactionId, otpCode);
      await completeLogin(transactionId);
      navigate('/dashboard/main');
    } catch (error) {
      setError(error.response?.data?.detail || "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      const response = await resendOtp(transactionId);
      
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

  // New methods for password reset
  const handleForgotPassword = async () => {
    setStep('resetRequest');
  };

  const handleResetRequest = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const response = await requestPasswordReset(email);
      setTransactionId(response.transaction_id);
      
      if (response.otp_expires_at) {
        setOtpExpiresAt(response.otp_expires_at);
      }
      
      setStep('resetOtp');
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await verifyOtp(transactionId, otpCode);
      setStep('resetPassword');
    } catch (error) {
      setError(error.response?.data?.detail || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      setLoading(true);
      setError('');
      await completePasswordReset(email, newPassword, transactionId);
      setStep('resetComplete');
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupClick = () => {
    navigate("/signup");
  };

  const formatTime = (seconds) => {
    if (seconds === null) return "";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginPanel}>
        <div className={styles.loginContent}>
          {/* Title based on current step */}
          {['email', 'password', 'otp'].includes(step) && (
            <>
              <h1>Welcome back!</h1>
              <p>Sign in to your account</p>
            </>
          )}
          
          {step === 'resetRequest' && (
            <>
              <h1>Reset Password</h1>
              <p>Enter your email to reset your password</p>
            </>
          )}
          
          {step === 'resetOtp' && (
            <>
              <h1>Verify Your Email</h1>
              <p>Enter the code sent to your email</p>
            </>
          )}
          
          {step === 'resetPassword' && (
            <>
              <h1>Create New Password</h1>
              <p>Enter a new password for your account</p>
            </>
          )}
          
          {step === 'resetComplete' && (
            <>
              <h1>Password Reset Complete</h1>
              <p>You can now log in with your new password</p>
            </>
          )}
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          {/* Only show Google login option on the email step */}
          {step === 'email' && (
            <>
              <div className={styles.socialLogins}>
                <button className={`${styles.socialButton} ${styles.google}`} onClick={signInWithGoogle}>
                  <img src="/google-icon.svg" alt="Google" />
                  Sign in with Google
                </button>
              </div>
              
              <div className={styles.divider}>
                <span>OR</span>
              </div>
            </>
          )}
          
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className={styles.form}>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
                autoComplete="email"
              />
              <button
                type="submit"
                className={styles.continueButton}
                disabled={loading}
              >
                {loading ? "Loading..." : "Continue"}
              </button>
              
              {/* Add forgot password link */}
              <button 
                type="button"
                onClick={handleForgotPassword}
                className={styles.forgotPasswordLink}
              >
                Forgot password?
              </button>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={handlePasswordSubmit} className={styles.form}>
              <div className={styles.passwordField}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={styles.input}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <button
                type="submit"
                className={styles.continueButton}
                disabled={loading}
              >
                {loading ? "Loading..." : "Login"}
              </button>
              <button
                type="button"
                className={styles.backButton}
                onClick={() => setStep("email")}
              >
                Back
              </button>
              
              {/* Add forgot password link */}
              <button 
                type="button"
                onClick={handleForgotPassword}
                className={styles.forgotPasswordLink}
              >
                Forgot password?
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className={styles.form}>
              <p className={styles.otpPrompt}>
                Enter the verification code sent to your email
              </p>
              {timeRemaining !== null && timeRemaining > 0 && (
                <p className={styles.otpTimer}>
                  Code expires in: {formatTime(timeRemaining)}
                </p>
              )}
              <input
                type="text"
                placeholder="Verification code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                required
                className={styles.input}
                autoComplete="one-time-code"
              />
              <button
                type="submit"
                className={styles.continueButton}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
              <button
                type="button"
                className={styles.resendButton}
                onClick={handleResendOtp}
                disabled={
                  loading || (timeRemaining !== null && timeRemaining > 0)
                }
              >
                {timeRemaining !== null && timeRemaining > 0
                  ? `Resend code in ${formatTime(timeRemaining)}`
                  : "Resend code"}
              </button>
            </form>
          )}
          
          {/* Reset Password Request Form */}
          {step === 'resetRequest' && (
            <form onSubmit={handleResetRequest} className={styles.form}>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
                autoComplete="email"
              />
              <button 
                type="submit" 
                className={styles.continueButton}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Send Reset Link'}
              </button>
              <button 
                type="button" 
                className={styles.backButton}
                onClick={() => setStep('email')}
              >
                Back to Login
              </button>
            </form>
          )}
          
          {/* Reset Password OTP Verification Form */}
          {step === 'resetOtp' && (
            <form onSubmit={handleResetOtpSubmit} className={styles.form}>
              <p className={styles.otpPrompt}>Enter the verification code sent to <span className={styles.emailHighlight}>{email}</span></p>
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
                autoComplete="one-time-code"
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
                onClick={() => setStep('resetRequest')}
              >
                Back
              </button>
            </form>
          )}
          
          {/* Set New Password Form */}
          {step === 'resetPassword' && (
            <form onSubmit={handleResetPasswordSubmit} className={styles.form}>
              <div className={styles.passwordField}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className={styles.input}
                  autoComplete="new-password"
                />
                <button 
                  type="button" 
                  className={styles.togglePassword}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className={styles.passwordField}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={styles.input}
                  autoComplete="new-password"
                />
              </div>
              <button 
                type="submit" 
                className={styles.continueButton}
                disabled={loading}
              >
                {loading ? 'Setting Password...' : 'Set New Password'}
              </button>
            </form>
          )}
          
          {/* Reset Complete */}
          {step === 'resetComplete' && (
            <div>
              <p className={styles.successMessage}>Your password has been reset successfully!</p>
              <button 
                onClick={() => setStep('email')} 
                className={styles.continueButton}
              >
                Back to Login
              </button>
            </div>
          )}
          
          {['email', 'password', 'otp'].includes(step) && (
            <div className={styles.signupLink}>
              <p>Don't have an account? <button onClick={handleSignupClick}>Sign up</button></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
