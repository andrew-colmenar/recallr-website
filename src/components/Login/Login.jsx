import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { signInWithGoogle } from "../GoogleAuth";
import styles from "./Login.module.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState("email"); // email -> password -> otp -> complete
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  const navigate = useNavigate();
  const { login, completeLogin, verifyOtp, resendOtp } = useAuth();

  useEffect(() => {
    let timer;
    if (otpExpiresAt) {
      timer = setInterval(() => {
        const expiryTime = new Date(otpExpiresAt).getTime();
        const currentTime = new Date().getTime();
        const remaining = Math.max(
          0,
          Math.floor((expiryTime - currentTime) / 1000)
        );

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
      setError("");
      // Move to password step
      setStep("password");
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

      // Set OTP expiration time from API response
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
      navigate("/dashboard"); // Navigate to dashboard after successful login
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

      // Update OTP expiration time after resend
      if (response && response.otp_expires_at) {
        setOtpExpiresAt(response.otp_expires_at);
      }

      setError("");
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupClick = () => {
    navigate("/signup");
  };

  // Format remaining time as MM:SS
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
          <h1>Welcome back!</h1>
          <p>Sign in to your account</p>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.socialLogins}>
            <button
              className={`${styles.socialButton} ${styles.google}`}
              onClick={signInWithGoogle}
            >
              <img src="/google-icon.svg" alt="Google" />
              Sign in with Google
            </button>
          </div>

          <div className={styles.divider}>
            <span>OR</span>
          </div>

          {step === "email" && (
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

          <div className={styles.signupLink}>
            <p>
              Don't have an account?{" "}
              <button onClick={handleSignupClick}>Sign up</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
