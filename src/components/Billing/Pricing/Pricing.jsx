import React from 'react';
import { Check, Sparkles, Shield } from "lucide-react";
import styles from './Pricing.module.css';

const Pricing = () => {
  return (
    <div className={styles['pricing-container']}>
      <div className={styles['pricing-content']}>
        <h1 className={styles['pricing-title']}>Manage your plan</h1>

        <div className={styles['plans-grid']}>
          {/* Free Plan */}
          <div className={styles['plan-card']}>
            <div className={styles['plan-header']}>
              <h2 className={styles['plan-name']}>Free</h2>
            </div>
            <div className={styles['plan-features']}>
              <div className={styles['feature-list']}>
                <div className={styles['feature-item']}>
                  <Check className={styles['feature-icon']} />
                  <p>AI-generated project briefs</p>
                </div>
                <div className={styles['feature-item']}>
                  <Check className={styles['feature-icon']} />
                  <p>Basic editing</p>
                </div>
                <div className={styles['feature-item']}>
                  <Check className={styles['feature-icon']} />
                  <p>Shareable links</p>
                </div>
                <div className={styles['feature-item']}>
                  <Sparkles className={`${styles['feature-icon']} ${styles['special']}`} />
                  <p className={styles['text-special']}>5 generation credits/month</p>
                </div>
              </div>
            </div>
            <div className={styles['plan-pricing']}>
              <div className={styles['price']}>
                <span className={styles['price-amount']}>$0</span>
                <span className={styles['price-period']}>/ month</span>
              </div>
              <button className={styles['current-plan-button']}>
                Your current plan
              </button>
            </div>
          </div>

          {/* Premium Plan */}
          <div className={styles['plan-card']}>
            {/* Gradient corner effect */}
            <div className={`${styles['corner-gradient']} ${styles['premium-gradient']}`}></div>

            <div className={styles['plan-header']}>
              <h2 className={styles['plan-name']}>Premium</h2>
            </div>
            <div className={styles['plan-features']}>
              <div className={styles['feature-list']}>
                <div className={styles['feature-item']}>
                  <Check className={`${styles['feature-icon']} ${styles['green']}`} />
                  <p>Including all free features</p>
                </div>
                <div className={styles['feature-item']}>
                  <Check className={`${styles['feature-icon']} ${styles['green']}`} />
                  <p>No watermarks on shared links</p>
                </div>
                <div className={styles['feature-item']}>
                  <Check className={`${styles['feature-icon']} ${styles['green']}`} />
                  <p>Section regeneration</p>
                </div>
                <div className={styles['feature-item']}>
                  <Check className={`${styles['feature-icon']} ${styles['green']}`} />
                  <p>Multi-Format Support</p>
                </div>
                <div className={styles['feature-item']}>
                  <Check className={`${styles['feature-icon']} ${styles['green']}`} />
                  <p>Memory Insights & Reports</p>
                </div>
                <div className={styles['feature-item']}>
                  <Sparkles className={`${styles['feature-icon']} ${styles['special']}`} />
                  <p className={styles['text-special']}>25 generation credits/month</p>
                </div>
              </div>
            </div>
            <div className={styles['plan-pricing']}>
              <div className={styles['price']}>
                <span className={styles['price-amount']}>$3</span>
                <span className={styles['price-period']}>/ month</span>
              </div>
              <button className={styles['upgrade-button']}>
                Upgrade to Premium
              </button>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className={styles['plan-card']}>
            {/* Gradient corner effect - using blue tones for enterprise */}
            <div className={`${styles['corner-gradient']} ${styles['enterprise-gradient']}`}></div>

            <div className={styles['plan-header']}>
              <h2 className={styles['plan-name']}>Enterprise</h2>
            </div>
            <div className={styles['plan-features']}>
              <div className={styles['feature-list']}>
                <div className={styles['feature-item']}>
                  <Check className={`${styles['feature-icon']} ${styles['blue']}`} />
                  <p>All Premium features</p>
                </div>
                <div className={styles['feature-item']}>
                  <Check className={`${styles['feature-icon']} ${styles['blue']}`} />
                  <p>Custom branding options</p>
                </div>
                <div className={styles['feature-item']}>
                  <Check className={`${styles['feature-icon']} ${styles['blue']}`} />
                  <p>Advanced integration APIs</p>
                </div>
                <div className={styles['feature-item']}>
                  <Check className={`${styles['feature-icon']} ${styles['blue']}`} />
                  <p>Dedicated account manager</p>
                </div>
                <div className={styles['feature-item']}>
                  <Shield className={`${styles['feature-icon']} ${styles['blue']}`} />
                  <p>Enhanced security & compliance</p>
                </div>
                <div className={styles['feature-item']}>
                  <Sparkles className={`${styles['feature-icon']} ${styles['blue']}`} />
                  <p className={styles['text-blue-special']}>Unlimited generation credits</p>
                </div>
              </div>
            </div>
            <div className={styles['plan-pricing']}>
              <div className={styles['price']}>
                <span className={styles['price-amount']}>Custom</span>
              </div>
              <button className={styles['contact-button']}>
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;