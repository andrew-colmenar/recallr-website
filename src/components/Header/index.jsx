import React, { useState } from 'react';
import styles from './Header.module.css';

const Header = ({ isLoggedIn = false, userEmail = '', userAvatar = '' }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  
  // Sample projects list
  const projects = [
    { id: 1, name: 'Project Alpha' },
    { id: 2, name: 'Project Beta' },
    { id: 3, name: 'Project Gamma' }
  ];
  
  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    // Close project menu if open
    if (isProjectMenuOpen) setIsProjectMenuOpen(false);
  };
  
  const toggleProjectMenu = () => {
    setIsProjectMenuOpen(!isProjectMenuOpen);
    // Close profile menu if open
    if (isProfileMenuOpen) setIsProfileMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logoContainer}>
          <a href="/" className={styles.logo}>
            AppName
          </a>
        </div>
        
        {/* Navigation Links */}
        <nav className={styles.navigation}>
          <div className={styles.navItem}>
            <div 
              className={styles.projectSelector} 
              onClick={toggleProjectMenu}
            >
              <span>Select Project</span>
              <svg className={styles.chevron} viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M7 10l5 5 5-5z" />
              </svg>
              
              {/* Project Dropdown Menu */}
              {isProjectMenuOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownHeader}>Your Projects</div>
                  {projects.map(project => (
                    <a 
                      key={project.id} 
                      href={`/projects/${project.id}`} 
                      className={styles.dropdownItem}
                    >
                      {project.name}
                    </a>
                  ))}
                  <div className={styles.dropdownDivider}></div>
                  <a href="/projects/new" className={styles.dropdownItem}>
                    + Create New Project
                  </a>
                </div>
              )}
            </div>
          </div>
          
          <a href="/playground" className={styles.navItem}>
            Playground
          </a>
          
          <a href="/" className={styles.navItem}>
            Dashboard
          </a>
          
          <a href="/docs" className={styles.navItem}>
            Docs
          </a>
        </nav>
        
        {/* Right Side - Login/Profile */}
        <div className={styles.rightSection}>
          {isLoggedIn ? (
            <div className={styles.profileContainer}>
              <div 
                className={styles.profile} 
                onClick={toggleProfileMenu}
              >
                {userAvatar ? (
                  <img 
                    src={userAvatar} 
                    alt="User avatar" 
                    className={styles.avatar} 
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {userEmail.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className={`${styles.dropdownMenu} ${styles.profileMenu}`}>
                    <div className={styles.userInfo}>
                      <div className={styles.userEmail}>{userEmail}</div>
                    </div>
                    <div className={styles.dropdownDivider}></div>
                    <a href="/profile" className={styles.dropdownItem}>
                      Your Profile
                    </a>
                    <a href="/settings" className={styles.dropdownItem}>
                      Settings
                    </a>
                    <div className={styles.dropdownDivider}></div>
                    <a href="/logout" className={styles.dropdownItem}>
                      Log Out
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <a href="/login" className={styles.loginButton}>
              Log In
            </a>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;