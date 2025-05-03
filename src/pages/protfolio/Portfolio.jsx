import React, { useEffect, useRef, useState } from 'react';
import styles from './Portfolio.module.css';
import portfolioService from '../../services/portfolioService';
import placeholderImage from '../../assets/placeholder.js';

// Import fallback images if needed
import portfolioImage from '../../assets/projects/portfolio.jpg';
import tradingChartImage from '../../assets/trading-chart1.jpg';
import cyberfuturismImage from '../../assets/cyberfuturism.jpg';
import profileSmilingImage from '../../assets/profile-smiling.jpg';
import japanShoreImage from '../../assets/japan-shore.jpg';
import cryptoResearchImage from '../../assets/projects/crypto-research.jpg';

const Portfolio = () => {
  const projectItems = useRef([]);
  const [projectsData, setProjectsData] = useState([]);
  const [imageSources, setImageSources] = useState({});
  
  // Handler for image loading errors
  const handleImageError = (title) => {
    setImageSources(prev => ({
      ...prev,
      [title]: placeholderImage
    }));
  };
  
  // Fallback images for demo purposes - Check if imports are available
  const fallbackImages = [
    placeholderImage, // Always use placeholder as first fallback
    ...(portfolioImage ? [portfolioImage] : []),
    ...(tradingChartImage ? [tradingChartImage] : []), 
    ...(cyberfuturismImage ? [cyberfuturismImage] : []),
    ...(profileSmilingImage ? [profileSmilingImage] : []),
    ...(japanShoreImage ? [japanShoreImage] : []),
    ...(cryptoResearchImage ? [cryptoResearchImage] : [])
  ].filter(Boolean); // Filter out any undefined values
  
  useEffect(() => {
    // Initialize localStorage if needed
    portfolioService.initializeStorage();
    
    // Increment portfolio views count
    portfolioService.incrementPortfolioViews();
    
    // Fetch projects data from localStorage
    const fetchData = () => {
      const dataPromise = portfolioService.getSectionData('projects');
      
      // Handle async data properly
      if (dataPromise && dataPromise.then) {
        dataPromise.then(data => {
          if (Array.isArray(data)) {
            setProjectsData(data);
            console.log("Projects data loaded:", data);
          } else {
            setProjectsData([]);
            console.log("No projects data found or invalid format");
          }
        }).catch(err => {
          console.error("Error loading projects data:", err);
          setProjectsData([]);
        });
      } else if (Array.isArray(dataPromise)) {
        // Handle case where it might return data directly
        setProjectsData(dataPromise);
        console.log("Projects data loaded (direct):", dataPromise);
      } else {
        // Fallback to empty array
        setProjectsData([]);
        console.log("No projects data or invalid format");
      }
    };
    
    // Initial data fetch
    fetchData();
    
    // Listen for changes to localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'portfolio_projects' || e.key === 'lastUpdate') {
        console.log("Storage change detected for projects");
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
      const currentItems = projectItems.current;
      
      if (currentItems && currentItems.forEach) {
        currentItems.forEach((item) => {
          if (item) observer.observe(item);
        });
      }
    };
    
    // Set up observer after data is loaded
    if (projectsData.length > 0) {
      setTimeout(updateObserver, 100);
    }
    
    return () => {
      // Cleanup observer
      const currentItems = projectItems.current;
      if (currentItems && currentItems.forEach) {
        currentItems.forEach((item) => {
          if (item) observer.unobserve(item);
        });
      }
      
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [projectsData.length]);
  
  // Manually force an update to the component when localStorage is changed from this window
  useEffect(() => {
    const handleLocalChange = () => {
      const dataPromise = portfolioService.getSectionData('projects');
      
      // Handle async data properly
      if (dataPromise && dataPromise.then) {
        dataPromise.then(data => {
          if (Array.isArray(data)) {
            setProjectsData(data);
          } else {
            setProjectsData([]);
          }
        }).catch(() => {
          setProjectsData([]);
        });
      } else if (Array.isArray(dataPromise)) {
        setProjectsData(dataPromise);
      } else {
        setProjectsData([]);
      }
    };
    
    window.addEventListener('localDataChanged', handleLocalChange);
    
    return () => {
      window.removeEventListener('localDataChanged', handleLocalChange);
    };
  }, []);
  
  // Check if we have projects data
  if (!projectsData || projectsData.length === 0) {
    return null; // Don't render the section if no data
  }
  
  return (
    <section id="portfolio" className={styles.portfolio}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Portfolio</h2>
        
        <div className={styles.portfolioGrid}>
          {projectsData.map((project, index) => (
            project && (
              <div 
                key={index} 
                className={`${styles.projectCard}`}
                ref={el => projectItems.current[index] = el}
              >
                <div className={styles.projectImage}>
                  <img 
                    src={imageSources[project.title] || project.image || (fallbackImages.length > 0 ? fallbackImages[index % fallbackImages.length] : placeholderImage)} 
                    alt={project.title || 'Project'}
                    onError={() => handleImageError(project.title || `project-${index}`)}
                  />
                </div>
                <div className={styles.projectContent}>
                  <span className={styles.projectTag}>{project.category || 'Project'}</span>
                  <h3>{project.title || `Project ${index + 1}`}</h3>
                  <p>{project.description || ''}</p>
                  
                  {project.technologies && (
                    <div className={styles.projectTools}>
                      <h4>Technologies Used:</h4>
                      <div className={styles.toolsContainer}>
                        {project.technologies.split(',').map((tech, techIndex) => (
                          <span key={techIndex} className={styles.toolTag}>
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className={styles.projectLinks}>
                    {project.demoUrl && (
                      <a href={project.demoUrl} className={styles.viewProject} target="_blank" rel="noopener noreferrer">
                        Live Demo <i className="fas fa-external-link-alt"></i>
                      </a>
                    )}
                    {project.repoUrl && (
                      <a href={project.repoUrl} className={styles.viewSource} target="_blank" rel="noopener noreferrer">
                        Source <i className="fab fa-github"></i>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          )).filter(Boolean)}
        </div>
      </div>
    </section>
  );
};

export default Portfolio; 