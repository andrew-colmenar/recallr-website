import React, { useState, useEffect } from 'react';
import { appApi } from '../../../api/axios';
import Cookies from 'js-cookie';
import { AlertCircle, ArrowRight, CreditCard, FileText, BarChart2, Star } from 'lucide-react';
import styles from './Billing.module.css';

const Billing = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState(null);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(false);
  const [transactionPage, setTransactionPage] = useState(0);
  const [topUpAmount, setTopUpAmount] = useState(10); // Default amount in dollars
  const [isSubmittingTopUp, setIsSubmittingTopUp] = useState(false);
  const [topUpError, setTopUpError] = useState(null);

  const TRANSACTION_LIMIT = 10;

  // Fetch balance data when component mounts or tab changes to overview
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchBalance();
    }
  }, [activeTab]);

  // Fetch transaction history when tab changes to history
  useEffect(() => {
    if (activeTab === 'history') {
      fetchTransactions(0);
    }
  }, [activeTab]);

  const fetchBalance = async () => {
    setBalanceLoading(true);
    setBalanceError(null);
    
    try {
      const user_id = Cookies.get('user_id');
      const session_id = Cookies.get('session_id');
      
      if (!user_id || !session_id) {
        throw new Error('Authentication required');
      }
      
      // Fix the path - Add a LEADING SLASH to ensure proper proxy routing
      const response = await appApi.get('/billing/balance', {
        headers: {
          'X-User-Id': user_id,
          'X-Session-Id': session_id
        }
      });
      
      setBalance(response.data);
    } catch (error) {
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request
        console.error('Request setup error:', error.message);
      }
      setBalanceError('Failed to load account balance. Please try again.');
    } finally {
      setBalanceLoading(false);
    }
  };

  const fetchTransactions = async (offset = 0, append = false) => {
    if (offset === 0) {
      setTransactionsLoading(true);
    }
    
    setTransactionsError(null);
    
    try {
      const user_id = Cookies.get('user_id');
      const session_id = Cookies.get('session_id');
      
      if (!user_id || !session_id) {
        throw new Error('Authentication required');
      }
      
      // Fix the path - Add a LEADING SLASH to ensure proper proxy routing
      const response = await appApi.get('/billing/transactions', {
        headers: {
          'X-User-Id': user_id,
          'X-Session-Id': session_id
        },
        params: {
          offset: offset,
          limit: TRANSACTION_LIMIT
        }
      });
      
      const { transactions: newTransactions, total, has_more } = response.data;
      
      if (append) {
        setTransactions(prevTransactions => [...prevTransactions, ...(newTransactions || [])]);
      } else {
        setTransactions(newTransactions || []);
      }
      
      setHasMoreTransactions(has_more || false);
      setTransactionPage(Math.floor(offset / TRANSACTION_LIMIT));
    } catch (error) {
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Request setup error:', error.message);
      }
      setTransactionsError('Failed to load transaction history. Please try again.');
    } finally {
      setTransactionsLoading(false);
    }
  };

  const loadMoreTransactions = () => {
    const nextOffset = (transactionPage + 1) * TRANSACTION_LIMIT;
    fetchTransactions(nextOffset, true);
  };

  const handleTopUp = async () => {
    setIsSubmittingTopUp(true);
    setTopUpError(null);
    
    try {
      const user_id = Cookies.get('user_id');
      const session_id = Cookies.get('session_id');
      
      if (!user_id || !session_id) {
        throw new Error('Authentication required');
      }
      
      // Fix the path - Add a LEADING SLASH to ensure proper proxy routing
      const response = await appApi.post('/billing/top-up', {
        amount: parseInt(topUpAmount), // Ensure it's an integer
        currency: 'usd',
        payment_provider: 'stripe'
      }, {
        headers: {
          'X-User-Id': user_id,
          'X-Session-Id': session_id
        }
      });
      
      // Redirect to checkout URL from response
      if (response.data && response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        throw new Error('Invalid checkout URL received');
      }
    } catch (error) {
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        if (error.response.data?.detail) {
          if (Array.isArray(error.response.data.detail)) {
            setTopUpError(error.response.data.detail[0]?.msg || 'Failed to process payment');
          } else {
            setTopUpError(error.response.data.detail || 'Failed to process payment');
          }
        } else {
          setTopUpError('Failed to process payment. Please try again.');
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        setTopUpError('Server did not respond. Please try again later.');
      } else {
        console.error('Request setup error:', error.message);
        setTopUpError('Network error. Please check your connection and try again.');
      }
      
      setIsSubmittingTopUp(false);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(parseFloat(amount));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'success':
        return styles['status-success'];
      case 'pending':
        return styles['status-pending'];
      case 'failed':
        return styles['status-failed'];
      default:
        return '';
    }
  };

  return (
    <div className={styles['billing-container']}>
      <h1 className={styles['billing-title']}>Billing & Subscription</h1>
      
      <div className={styles['billing-tabs']}>
        <button 
          className={`${styles['tab-button']} ${activeTab === 'overview' ? styles['active'] : ''}`} 
          onClick={() => handleTabClick('overview')}
        >
          Overview
        </button>
        <button 
          className={`${styles['tab-button']} ${activeTab === 'history' ? styles['active'] : ''}`} 
          onClick={() => handleTabClick('history')}
        >
          Payment History
        </button>
        {/* <button 
          className={`${styles['tab-button']} ${activeTab === 'pricing' ? styles['active'] : ''}`} 
          onClick={() => handleTabClick('pricing')}
        >
          Plans & Pricing
        </button> */}
      </div>
      
      <div className={styles['billing-content']}>
        {activeTab === 'overview' && (
          <div className={styles['overview-section']}>
            <div className={styles['balance-section']}>
              <h3 className={styles['section-title']}>Account Balance</h3>
              {balanceLoading ? (
                <div className={styles['loading']}>Loading balance...</div>
              ) : balanceError ? (
                <div className={styles['error-message']}>
                  <AlertCircle size={16} />
                  <span>{balanceError}</span>
                </div>
              ) : (
                <>
                  <div className={styles['credit-info']}>
                    <p className={styles['credit-label']}>Current balance <span className={styles['info-icon']}>ⓘ</span></p>
                    <h1 className={styles['credit-amount']}>
                      {formatCurrency(balance?.balance || 0, balance?.currency)}
                    </h1>
                    <p className={styles['last-updated']}>
                      Last updated: {balance ? formatDate(balance.last_updated) : 'N/A'}
                    </p>
                  </div>
                  
                  <div className={styles['top-up-section']}>
                    <h4 className={styles['top-up-title']}>Add funds to your account</h4>
                    
                    {topUpError && (
                      <div className={styles['error-message']}>
                        <AlertCircle size={16} />
                        <span>{topUpError}</span>
                      </div>
                    )}
                    
                    <div className={styles['amount-selector']}>
                      {[10, 50, 100].map(amount => (
                        <button 
                          key={amount}
                          className={`${styles['amount-button']} ${topUpAmount === amount ? styles['selected'] : ''}`}
                          onClick={() => setTopUpAmount(amount)}
                        >
                          ${amount}
                        </button>
                      ))}
                      <div className={styles['custom-amount']}>
                        <span>$</span>
                        <input 
                          type="number" 
                          min="1" 
                          value={topUpAmount}
                          onChange={(e) => setTopUpAmount(Math.max(1, parseInt(e.target.value) || 0))}
                          className={styles['amount-input']}
                        />
                      </div>
                    </div>
                    
                    <button 
                      className={`${styles['button']} ${styles['primary-button']} ${styles['top-up-button']}`}
                      onClick={handleTopUp}
                      disabled={isSubmittingTopUp}
                    >
                      {isSubmittingTopUp ? 'Processing...' : `Add ${formatCurrency(topUpAmount)}`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className={styles['history-section']}>
            <h3 className={styles['section-title']}>Transaction History</h3>
            
            {transactionsLoading && transactions.length === 0 ? (
              <div className={styles['loading']}>Loading transactions...</div>
            ) : transactionsError ? (
              <div className={styles['error-message']}>
                <AlertCircle size={16} />
                <span>{transactionsError}</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className={styles['no-invoices']}>
                No transaction history available yet.
              </div>
            ) : (
              <>
                <div className={styles['transactions-table']}>
                  <div className={styles['table-header']}>
                    <div className={styles['header-cell']}>Transaction</div>
                    <div className={styles['header-cell']}>Date</div>
                    <div className={styles['header-cell']}>Amount</div>
                    <div className={styles['header-cell']}>Status</div>
                    <div className={styles['header-cell']}>Actions</div>
                  </div>
                  
                  {transactions.map((transaction, index) => (
                    <div key={index} className={styles['table-row']}>
                      <div className={styles['cell']}>{transaction.invoice_number}</div>
                      <div className={styles['cell']}>{formatDate(transaction.created_at)}</div>
                      <div className={styles['cell']}>{formatCurrency(transaction.amount, transaction.currency)}</div>
                      <div className={styles['cell']}>
                        <span className={`${styles['status']} ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                      <div className={styles['cell']}>
                        {transaction.invoice_url && (
                          <a 
                            href={transaction.invoice_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles['invoice-link']}
                          >
                            View Invoice
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {hasMoreTransactions && (
                  <div className={styles['load-more']}>
                    <button 
                      className={styles['load-more-button']}
                      onClick={loadMoreTransactions}
                      disabled={transactionsLoading}
                    >
                      {transactionsLoading ? 'Loading...' : 'Load More Transactions'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {/* {activeTab === 'pricing' && (
          <div className={styles['pricing-section']}>
            <h3 className={styles['section-title']}>Plans & Pricing</h3>
            
            <div className={styles['pricing-plans']}>
              <div className={styles['pricing-card']}>
                <h4>Free</h4>
                <div className={styles['price']}>$0/month</div>
                <ul className={styles['features-list']}>
                  <li>5,000 API calls/month</li>
                  <li>Basic rate limiting</li>
                  <li>Community support</li>
                </ul>
                <button className={`${styles['button']} ${styles['secondary-button']}`}>Current Plan</button>
              </div>
              
              <div className={`${styles['pricing-card']} ${styles['highlighted']}`}>
                <h4>Pro</h4>
                <div className={styles['price']}>$29/month</div>
                <ul className={styles['features-list']}>
                  <li>50,000 API calls/month</li>
                  <li>Higher rate limits</li>
                  <li>Email support</li>
                  <li>Advanced analytics</li>
                </ul>
                <button 
                  className={`${styles['button']} ${styles['primary-button']}`}
                  onClick={() => window.open('mailto:sales@recallrai.com?subject=Upgrade%20to%20Pro%20Plan', '_blank')}
                >
                  Upgrade to Pro
                </button>
              </div>
              
              <div className={styles['pricing-card']}>
                <h4>Enterprise</h4>
                <div className={styles['price']}>Custom</div>
                <ul className={styles['features-list']}>
                  <li>Unlimited API calls</li>
                  <li>Dedicated infrastructure</li>
                  <li>24/7 priority support</li>
                  <li>Custom integrations</li>
                  <li>SLA guarantees</li>
                </ul>
                <button 
                  className={`${styles['button']} ${styles['secondary-button']}`}
                  onClick={() => window.open('mailto:enterprise@recallrai.com?subject=Enterprise%20Plan%20Inquiry', '_blank')}
                >
                  Contact Sales
                </button>
              </div>
            </div>
            
            <div className={styles['faq-section']}>
              <h3 className={styles['section-title']}>Frequently Asked Questions</h3>
              
              <div className={styles['faq-item']}>
                <h4>How will I be billed?</h4>
                <p>You'll be billed monthly based on your chosen plan. All plans are billed automatically at the start of each billing period.</p>
              </div>
              
              <div className={styles['faq-item']}>
                <h4>Can I change plans at any time?</h4>
                <p>Yes, you can upgrade or downgrade your plan at any time. Changes will be effective immediately.</p>
              </div>
              
              <div className={styles['faq-item']}>
                <h4>Is there a contract or commitment?</h4>
                <p>No, all plans are month-to-month with no long-term contracts. You can cancel at any time.</p>
              </div>
              
              <div className={styles['faq-item']}>
                <h4>What payment methods do you accept?</h4>
                <p>We accept all major credit cards (Visa, MasterCard, American Express) and PayPal.</p>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Billing;