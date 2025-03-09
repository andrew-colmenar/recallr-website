import React from 'react';
import styles from './Home.module.css';
import { useData } from '../../hooks/useData';

const Home = () => {
  const { data, loading, error } = useData('/dashboard');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className={styles.container}>
      <h2>Welcome to Dashboard</h2>
      <div className={styles.content}>
        {/* Add your dashboard content here */}
      </div>
    </div>
  );
};

export default Home;