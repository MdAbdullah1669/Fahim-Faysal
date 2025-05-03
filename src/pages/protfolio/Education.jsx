import React, { useEffect, useRef, useState } from 'react';
import styles from './Education.module.css';
import portfolioService from '../../services/portfolioService';

const Education = () => {
  const educationItems = useRef([]);
  const [educationData, setEducationData] = useState([]);
  
  useEffect(() => {
    // Initialize localStorage if needed
    portfolioService.initializeStorage();
    
    // Fetch education data from localStorage
    const fetchData = () => {
      const dataPromise = portfolioService.getSectionData('education');
      
      // Handle async data properly
      if (dataPromise && dataPromise.then) {
        dataPromise.then(data => {
          if (Array.isArray(data)) {
            setEducationData(data);
            console.log("Education data loaded:", data);
          } else {
            setEducationData([]);
            console.log("No education data found or invalid format");
          }
        }).catch(err => {
          console.error("Error loading education data:", err);
          setEducationData([]);
        });
      } else if (Array.isArray(dataPromise)) {
        // Handle case where it might return data directly
        setEducationData(dataPromise);
        console.log("Education data loaded (direct):", dataPromise);
      } else {
        // Fallback to empty array
        setEducationData([]);
        console.log("No education data or invalid format");
      }
    };
    
    // Initial data fetch
    fetchData();
    
    // Listen for changes to localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'portfolio_education' || e.key === 'lastUpdate') {
        console.log("Storage change detected for education");
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
      const currentItems = educationItems.current;
      
      if (currentItems && currentItems.forEach) {
        currentItems.forEach((item) => {
          if (item) observer.observe(item);
        });
      }
    };
    
    // Set up observer after data is loaded
    if (educationData.length > 0) {
      setTimeout(updateObserver, 100);
    }
    
    return () => {
      // Cleanup observer
      const currentItems = educationItems.current;
      if (currentItems && currentItems.forEach) {
        currentItems.forEach((item) => {
          if (item) observer.unobserve(item);
        });
      }
      
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [educationData.length]);
  
  // Manually force an update to the component when localStorage is changed from this window
  useEffect(() => {
    const handleLocalChange = () => {
      const dataPromise = portfolioService.getSectionData('education');
      
      // Handle async data properly
      if (dataPromise && dataPromise.then) {
        dataPromise.then(data => {
          if (Array.isArray(data)) {
            setEducationData(data);
          } else {
            setEducationData([]);
          }
        }).catch(() => {
          setEducationData([]);
        });
      } else if (Array.isArray(dataPromise)) {
        setEducationData(dataPromise);
      } else {
        setEducationData([]);
      }
    };
    
    window.addEventListener('localDataChanged', handleLocalChange);
    
    return () => {
      window.removeEventListener('localDataChanged', handleLocalChange);
    };
  }, []);
  
  // Format a date from YYYY-MM to a readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const [year, month] = dateString.split('-');
      return `${year}`;
    } catch (error) {
      return dateString;
    }
  };
  
  // Check if we have education data
  if (!educationData || educationData.length === 0) {
    return null; // Don't render the section if no data
  }
  
  return (
    <section id="education" className={styles.education}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Education</h2>
        
        <div className={styles.educationGrid}>
          {educationData.map((edu, index) => (
            edu && (
              <div 
                key={index} 
                className={`${styles.eduItem} ${styles.glassCard}`}
                ref={el => educationItems.current[index] = el}
              >
                <h3>{edu.degree || 'Degree'}</h3>
                <h4>{edu.institution || 'Institution'}</h4>
                <h5>
                  {edu.location || 'Location'} | {
                    edu.current 
                      ? 'Current' 
                      : `${formatDate(edu.startDate)}${edu.endDate ? ` - ${formatDate(edu.endDate)}` : ''}`
                  }
                </h5>
                <p>{edu.description || ''}</p>
              </div>
            )
          )).filter(Boolean)}
        </div>
      </div>
    </section>
  );
};

export default Education; 