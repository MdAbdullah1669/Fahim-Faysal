import React, { useEffect, useRef, useState } from 'react';
import styles from './Pictures.module.css';
import portfolioService from '../../services/portfolioService';

const Pictures = () => {
  const pictureItems = useRef([]);
  const [picturesData, setPicturesData] = useState([]);
  
  // Function to create sample picture data if none exists
  const createSamplePictureData = () => {
    const sampleData = [
      {
        title: 'My Photography',
        category: 'Portfolio',
        description: 'A collection of my photography work.',
        link: '',
        image: null
      }
    ];
    
    portfolioService.saveSectionData('pictures', sampleData);
    return sampleData;
  };
  
  useEffect(() => {
    // Initialize localStorage if needed
    portfolioService.initializeStorage();
    
    // Fetch pictures data from localStorage
    const fetchData = () => {
      const dataPromise = portfolioService.getSectionData('pictures');
      
      // Handle async data properly
      if (dataPromise && dataPromise.then) {
        dataPromise.then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setPicturesData(data);
            console.log("Pictures data loaded:", data);
          } else {
            // If no data exists, create sample data
            const sampleData = createSamplePictureData();
            setPicturesData(sampleData);
            console.log("Created sample pictures data:", sampleData);
          }
        }).catch(err => {
          console.error("Error loading pictures data:", err);
          const sampleData = createSamplePictureData();
          setPicturesData(sampleData);
        });
      } else if (Array.isArray(dataPromise) && dataPromise.length > 0) {
        // Handle case where it might return data directly
        setPicturesData(dataPromise);
        console.log("Pictures data loaded (direct):", dataPromise);
      } else {
        // Create sample data as fallback
        const sampleData = createSamplePictureData();
        setPicturesData(sampleData);
        console.log("Created sample pictures data (fallback):", sampleData);
      }
    };
    
    // Initial data fetch
    fetchData();
    
    // Listen for changes to localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'portfolio_pictures' || e.key === 'lastUpdate') {
        console.log("Storage change detected for pictures");
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
      const currentItems = pictureItems.current;
      
      if (currentItems && currentItems.forEach) {
        currentItems.forEach((item) => {
          if (item) observer.observe(item);
        });
      }
    };
    
    // Set up observer after data is loaded
    if (picturesData.length > 0) {
      setTimeout(updateObserver, 100);
    }
    
    return () => {
      // Cleanup observer
      const currentItems = pictureItems.current;
      if (currentItems && currentItems.forEach) {
        currentItems.forEach((item) => {
          if (item) observer.unobserve(item);
        });
      }
      
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [picturesData.length]);
  
  // Manually force an update to the component when localStorage is changed from this window
  useEffect(() => {
    const handleLocalChange = () => {
      const dataPromise = portfolioService.getSectionData('pictures');
      
      // Handle async data properly
      if (dataPromise && dataPromise.then) {
        dataPromise.then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setPicturesData(data);
          } else {
            // If no data exists, create sample data
            const sampleData = createSamplePictureData();
            setPicturesData(sampleData);
          }
        }).catch(() => {
          const sampleData = createSamplePictureData();
          setPicturesData(sampleData);
        });
      } else if (Array.isArray(dataPromise) && dataPromise.length > 0) {
        setPicturesData(dataPromise);
      } else {
        const sampleData = createSamplePictureData();
        setPicturesData(sampleData);
      }
    };
    
    window.addEventListener('localDataChanged', handleLocalChange);
    
    return () => {
      window.removeEventListener('localDataChanged', handleLocalChange);
    };
  }, []);
  
  // Check if we have pictures data and if it contains images to display
  if (!picturesData || picturesData.length === 0 || !picturesData.some(pic => pic && pic.image)) {
    return null; // Don't render the section if no data or no images
  }
  
  return (
    <section id="pictures" className={styles.pictures}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Photography</h2>
        
        <div className={styles.picturesGrid}>
          {picturesData.map((picture, index) => (
            picture && picture.image && (
              <div 
                key={index} 
                className={`${styles.pictureCard}`}
                ref={el => pictureItems.current[index] = el}
              >
                <div className={styles.pictureImage}>
                  <img 
                    src={picture.image}
                    alt={picture.title || 'Photography'}
                    className={styles.pictureImg}
                  />
                </div>
                <div className={styles.pictureContent}>
                  <span className={styles.pictureTag}>{picture.category || 'Photography'}</span>
                  <h3>{picture.title || 'My Photography'}</h3>
                  <p>{picture.description || ''}</p>
                  {picture.link && (
                    <a href={picture.link} className={styles.viewPicture} target="_blank" rel="noopener noreferrer">
                      View Full Size <i className="fas fa-external-link-alt"></i>
                    </a>
                  )}
                </div>
              </div>
            )
          )).filter(Boolean)}
        </div>
      </div>
    </section>
  );
};

export default Pictures;