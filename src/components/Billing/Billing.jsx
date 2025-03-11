import React from 'react';
import { Check, Sparkles, Shield } from "lucide-react";
import '../../styles/Billing.css';

const Billing = () => {
  return (
    <div className="billing-container">
      <div className="billing-content">
        <h1 className="billing-title">Manage your plan</h1>

        <div className="plans-grid">
          {/* Free Plan */}
          <div className="plan-card free-plan">
            <div className="plan-header">
              <h2 className="plan-name">Free</h2>
            </div>
            <div className="plan-features">
              <div className="feature-list">
                <div className="feature-item">
                  <Check className="feature-icon" />
                  <p>AI-generated project briefs</p>
                </div>
                <div className="feature-item">
                  <Check className="feature-icon" />
                  <p>Basic editing</p>
                </div>
                <div className="feature-item">
                  <Check className="feature-icon" />
                  <p>Shareable links</p>
                </div>
                <div className="feature-item special">
                  <Sparkles className="feature-icon special" />
                  <p className="text-special">5 generation credits/month</p>
                </div>
              </div>
            </div>
            <div className="plan-pricing">
              <div className="price">
                <span className="price-amount">$0</span>
                <span className="price-period">/ month</span>
              </div>
              <button className="current-plan-button">
                Your current plan
              </button>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="plan-card premium-plan">
            {/* Gradient corner effect */}
            <div className="corner-gradient premium-gradient"></div>

            <div className="plan-header">
              <h2 className="plan-name">Premium</h2>
            </div>
            <div className="plan-features">
              <div className="feature-list">
                <div className="feature-item">
                  <Check className="feature-icon green" />
                  <p>Including all free features</p>
                </div>
                <div className="feature-item">
                  <Check className="feature-icon green" />
                  <p>No watermarks on shared links</p>
                </div>
                <div className="feature-item">
                  <Check className="feature-icon green" />
                  <p>Section regeneration</p>
                </div>
                <div className="feature-item">
                  <Check className="feature-icon green" />
                  <p>Multi-Format Support</p>
                </div>
                <div className="feature-item">
                  <Check className="feature-icon green" />
                  <p>Memory Insights & Reports</p>
                </div>
                <div className="feature-item special">
                  <Sparkles className="feature-icon special" />
                  <p className="text-special">25 generation credits/month</p>
                </div>
              </div>
            </div>
            <div className="plan-pricing">
              <div className="price">
                <span className="price-amount">$3</span>
                <span className="price-period">/ month</span>
              </div>
              <button className="upgrade-button">
                Upgrade to Premium
              </button>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="plan-card enterprise-plan">
            {/* Gradient corner effect - using blue tones for enterprise */}
            <div className="corner-gradient enterprise-gradient"></div>

            <div className="plan-header">
              <h2 className="plan-name">Enterprise</h2>
            </div>
            <div className="plan-features">
              <div className="feature-list">
                <div className="feature-item">
                  <Check className="feature-icon blue" />
                  <p>All Premium features</p>
                </div>
                <div className="feature-item">
                  <Check className="feature-icon blue" />
                  <p>Custom branding options</p>
                </div>
                <div className="feature-item">
                  <Check className="feature-icon blue" />
                  <p>Advanced integration APIs</p>
                </div>
                <div className="feature-item">
                  <Check className="feature-icon blue" />
                  <p>Dedicated account manager</p>
                </div>
                <div className="feature-item">
                  <Shield className="feature-icon blue" />
                  <p>Enhanced security & compliance</p>
                </div>
                <div className="feature-item blue-special">
                  <Sparkles className="feature-icon blue" />
                  <p className="text-blue-special">Unlimited generation credits</p>
                </div>
              </div>
            </div>
            <div className="plan-pricing">
              <div className="price">
                <span className="price-amount">Custom</span>
              </div>
              <button className="contact-button">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;