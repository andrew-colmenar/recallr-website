import React from 'react';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <h1>Dashboard</h1>
      <nav className={styles.nav}>
        <ul>
          <li>Home</li>
          <li>Analytics</li>
          <li>Settings</li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;