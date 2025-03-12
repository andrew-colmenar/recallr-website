import React, { useState } from 'react';
import styles from './CreateProject.module.css';

const CreateProject = () => {
  const [projectData, setProjectData] = useState({
    name: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle project creation logic here
    console.log('Creating project:', projectData);
  };

  return (
    <div className={styles['create-project-container']}>
      <div className={styles['create-project-card']}>
        <h2 className={styles['create-project-title']}>Create New Project</h2>
        
        <form onSubmit={handleSubmit} className={styles['create-project-form']}>
          <div className={styles['form-group']}>
            <label htmlFor="projectName">Project Name</label>
            <input
              type="text"
              id="projectName"
              name="name"
              value={projectData.name}
              onChange={handleChange}
              placeholder="Enter project name"
              required
            />
          </div>
          
          <div className={styles['form-group']}>
            <label htmlFor="projectDescription">Project Description</label>
            <textarea
              id="projectDescription"
              name="description"
              value={projectData.description}
              onChange={handleChange}
              placeholder="Enter project description"
              rows="4"
            />
          </div>
          
          <button type="submit" className={styles['create-project-button']}>
            Create Project
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;