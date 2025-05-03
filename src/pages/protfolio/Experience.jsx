import React, { useEffect, useRef, useState } from 'react';
import styles from './Experience.module.css';
import portfolioService from '../../services/portfolioService';

const Experience = () => {
  const experienceItems = useRef([]);
  const [experienceData, setExperienceData] = useState([]);
  
  useEffect(() => {
    // Initialize localStorage if needed
    portfolioService.initializeStorage();
    
    // Fetch experience data from localStorage
    const fetchData = () => {
      const dataPromise = portfolioService.getSectionData('experience');
      
      // Handle async data properly
      if (dataPromise && dataPromise.then) {
        dataPromise.then(data => {
          if (Array.isArray(data)) {
            setExperienceData(data);
            console.log("Experience data loaded:", data);
          } else {
            setExperienceData([]);
            console.log("No experience data found or invalid format");
          }
        }).catch(err => {
          console.error("Error loading experience data:", err);
          setExperienceData([]);
        });
      } else if (Array.isArray(dataPromise)) {
        // Handle case where it might return data directly
        setExperienceData(dataPromise);
        console.log("Experience data loaded (direct):", dataPromise);
      } else {
        // Fallback to empty array
        setExperienceData([]);
        console.log("No experience data or invalid format");
      }
    };
    
    // Initial data fetch
    fetchData();
    
    // Listen for changes to localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'portfolio_experience' || e.key === 'lastUpdate') {
        console.log("Storage change detected for experience");
        fetchData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for changes
    const interval = setInterval(fetchData, 3000);
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealed);
          }
        });
      },
      { threshold: 0.2 }
    );
    
    // Update observer for items
    const updateObserver = () => {
      const currentItems = experienceItems.current;
      
      if (currentItems && currentItems.forEach) {
        currentItems.forEach((item) => {
          if (item) observer.observe(item);
        });
      }
    };
    
    // Set up observer after data is loaded
    if (experienceData.length > 0) {
      setTimeout(updateObserver, 100);
    }
    
    return () => {
      // Cleanup observer
      const currentItems = experienceItems.current;
      if (currentItems && currentItems.forEach) {
        currentItems.forEach((item) => {
          if (item) observer.unobserve(item);
        });
      }
      
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [experienceData.length]);
  
  // Manually force an update to the component when localStorage is changed from this window
  useEffect(() => {
    const handleLocalChange = () => {
      const dataPromise = portfolioService.getSectionData('experience');
      
      // Handle async data properly
      if (dataPromise && dataPromise.then) {
        dataPromise.then(data => {
          if (Array.isArray(data)) {
            setExperienceData(data);
          } else {
            setExperienceData([]);
          }
        }).catch(() => {
          setExperienceData([]);
        });
      } else if (Array.isArray(dataPromise)) {
        setExperienceData(dataPromise);
      } else {
        setExperienceData([]);
      }
    };
    
    window.addEventListener('localDataChanged', handleLocalChange);
    
    return () => {
      window.removeEventListener('localDataChanged', handleLocalChange);
    };
  }, []);
  
  // Check if we have experience data
  if (!experienceData || experienceData.length === 0) {
    return null; // Don't render the section if no data
  }
  
  return (
    <section id="experience" className={styles.experience}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Work Experience</h2>
        
        <div className={styles.experienceGrid}>
          {experienceData.map((exp, index) => (
            exp && (
              <div 
                key={index} 
                className={`${styles.expItem} ${styles.glassCard}`}
                ref={el => experienceItems.current[index] = el}
              >
                <h3>{exp.position || 'Position'}</h3>
                <h4>{exp.company || 'Company'}</h4>
                <h5>{exp.location || 'Location'} | {exp.period || 'Time Period'}</h5>
                <p>{exp.description || ''}</p>
              </div>
            )
          )).filter(Boolean)}
        </div>
      </div>
    </section>
  );
};

export default Experience; 