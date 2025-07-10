import React, { useState, useEffect } from 'react';
import { appApi } from '../../../api/axios';
import Cookies from 'js-cookie';
import { 
  CreditCard, 
  Lock, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight,
  ArrowLeft,
  Loader2,
  Info
} from 'lucide-react';
import styles from './Payment.module.css';

const Payment = () => {

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  
  // Form states
  const [formData, setFormData] = useState({
    amount: 10,
    currency: 'usd'
  });



  // Amount options
  const amountOptions = [
    { value: 5, label: '$5.00' },
    { value: 10, label: '$10.00' },
    { value: 25, label: '$25.00' },
    { value: 50, label: '$50.00' },
    { value: 100, label: '$100.00' }
  ];

  // Fetch current balance on component mount
  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    setBalanceLoading(true);
    setError(null);

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
      
      // Handle specific error cases
      if (err.response) {
        switch (err.response.status) {
          case 401:
            setError('Authentication required. Please log in again.');
            break;
          case 404:
            // Balance endpoint might not exist yet, set default balance
            setBalance({ balance: 0, currency: 'usd' });
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError(`Failed to load account balance (${err.response.status}). Please try again.`);
        }
      } else if (err.request) {
        setError('No response from server. Please check your connection and try again.');
      } else {
        setError(err.message || 'Failed to load account balance. Please try again.');
      }
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const user_id = Cookies.get('user_id');
      const session_id = Cookies.get('session_id');

      if (!user_id || !session_id) {
        throw new Error('Authentication required');
      }

      // Prepare the request payload according to the API specification
      const payload = {
        amount: formData.amount,
        currency: formData.currency
      };

      const response = await appApi.post('/billing/top-up', payload, {
        headers: {
          'X-User-Id': user_id,
          'X-Session-Id': session_id,
          'Content-Type': 'application/json'
        }
      });

      // Handle the response based on the API specification
      if (response.data && response.data.checkout_url) {
        // Redirect to the checkout URL provided by the payment provider
        window.location.href = response.data.checkout_url;
      } else {
        throw new Error('Invalid checkout URL received from server');
      }

    } catch (err) {
      console.error('Payment processing error:', err);
      
      if (err.response) {
        // Handle different error status codes
        switch (err.response.status) {
          case 400:
            setError('Invalid request. Please check your payment details and try again.');
            break;
          case 401:
            setError('Authentication required. Please log in again.');
            break;
          case 422:
            // Handle validation errors
            if (err.response.data?.detail) {
              if (Array.isArray(err.response.data.detail)) {
                setError(err.response.data.detail[0]?.msg || 'Validation error. Please check your input.');
              } else {
                setError(err.response.data.detail || 'Validation error. Please check your input.');
              }
            } else {
              setError('Validation error. Please check your input.');
            }
            break;
          case 500:
            setError('Payment processing error. Please try again later.');
            break;
          default:
            setError('Payment failed. Please try again.');
        }
      } else if (err.request) {
        setError('No response from server. Please check your connection and try again.');
      } else {
        setError(err.message || 'Payment failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const validateForm = () => {
    if (formData.amount <= 0) return false;
    return true;
  };

  const formatCurrency = (amount, currency = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(parseFloat(amount));
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <CreditCard size={24} />
            </div>
            <div>
              <h1 className={styles.title}>Top Up Account</h1>
              <p className={styles.subtitle}>Add funds to your account balance</p>
            </div>
          </div>
        </div>

        {/* Current Balance Display */}
        {!balanceLoading && balance && (
          <div className={styles.balanceCard}>
            <div className={styles.balanceContent}>
              <span className={styles.balanceLabel}>Current Balance</span>
              <span className={styles.balanceAmount}>
                {formatCurrency(balance.balance || 0, balance.currency || 'usd')}
              </span>
            </div>
          </div>
        )}
        
        {/* Loading Balance */}
        {balanceLoading && (
          <div className={styles.balanceCard}>
            <div className={styles.balanceContent}>
              <span className={styles.balanceLabel}>Loading Balance...</span>
              <span className={styles.balanceAmount}>$0.00</span>
            </div>
          </div>
        )}

        {/* Notifications */}
        {error && (
          <div className={styles.errorMessage}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        {success && (
          <div className={styles.successMessage}>
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        <div className={styles.paymentContainer}>
          {/* Payment Summary */}
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Payment Summary</h2>
            <div className={styles.summaryContent}>
              <div className={styles.summaryRow}>
                <span>Top Up Amount</span>
                <span className={styles.amount}>{formatCurrency(formData.amount, formData.currency)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Processing Fee</span>
                <span>$0.00</span>
              </div>
              <div className={styles.summaryDivider}></div>
              <div className={styles.summaryRow}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalAmount}>{formatCurrency(formData.amount, formData.currency)}</span>
              </div>
            </div>
            

          </div>

          {/* Payment Form */}
          <div className={styles.formCard}>
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Amount Selection */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Top Up Amount</h3>
                <div className={styles.amountOptions}>
                  {amountOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`${styles.amountOption} ${formData.amount === option.value ? styles.selected : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, amount: option.value }))}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className={styles.customAmount}>
                  <label className={styles.label}>Custom Amount</label>
                  <div className={styles.currencyInput}>
                    <span className={styles.currencySymbol}>$</span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className={styles.input}
                      min="1"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className={styles.securityNotice}>
                <div className={styles.securityIcon}>
                  <Shield size={16} />
                </div>
                <div className={styles.securityText}>
                  <span className={styles.securityTitle}>Secure Payment</span>
                  <span className={styles.securityDescription}>
                    You'll be redirected to our secure payment processor to complete your transaction.
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className={styles.submitSection}>
                <button
                  type="submit"
                  disabled={isProcessing || !validateForm()}
                  className={styles.submitButton}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className={styles.spinner} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      Continue to Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment; 