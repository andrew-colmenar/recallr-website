import React from "react";
import styles from "./ComingSoon.module.css";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ComingSoon = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Coming Soon</h1>

        <p className={styles.subtitle}>
          We're working on something exciting for you
        </p>

        <div className={styles.timeline}>
          <div className={styles.timelineItem}>
            <div className={styles.timelineDot}></div>
            <div className={styles.timelineContent}>
              <h3>Design Phase</h3>
              <p>Completed</p>
            </div>
          </div>

          <div className={styles.timelineItem}>
            <div className={styles.timelineDot}></div>
            <div className={styles.timelineContent}>
              <h3>Development</h3>
              <p>In Progress</p>
            </div>
          </div>

          <div className={`${styles.timelineItem} ${styles.future}`}>
            <div className={styles.timelineDot}></div>
            <div className={styles.timelineContent}>
              <h3>Testing</h3>
              <p>Coming up next</p>
            </div>
          </div>

          <div className={`${styles.timelineItem} ${styles.future}`}>
            <div className={styles.timelineDot}></div>
            <div className={styles.timelineContent}>
              <h3>Launch</h3>
              <p>Stay tuned!</p>
            </div>
          </div>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🔍</div>
            <h3>Smart Search</h3>
            <p>Powerful semantic search capabilities</p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>🔄</div>
            <h3>Real-time Updates</h3>
            <p>Get instant information as it happens</p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>📊</div>
            <h3>Analytics</h3>
            <p>Detailed insights and visualizations</p>
          </div>
        </div>

        <Link to="/dashboard" className={styles.backButton}>
          <span>Back to Dashboard</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;
