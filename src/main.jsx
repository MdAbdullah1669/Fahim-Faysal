import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import portfolioService from './services/portfolioService';
import cloudSyncService from './services/cloudSyncService';

// Safety check for cloud data
const hasCloudData = window.CLOUD_PORTFOLIO_DATA && 
                     typeof window.CLOUD_PORTFOLIO_DATA === 'object' && 
                     Object.keys(window.CLOUD_PORTFOLIO_DATA).length > 0;

// Error boundary component to catch rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App crashed:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          fontFamily: 'Arial, sans-serif',
          maxWidth: '800px',
          margin: '40px auto',
          textAlign: 'center' 
        }}>
          <h1>Something went wrong</h1>
          <p>The application encountered an error. Please try the following:</p>
          <ul style={{ textAlign: 'left', display: 'inline-block' }}>
            <li>Refresh the page</li>
            <li>Clear your browser cache and try again</li>
            <li>If the problem persists, try clearing local storage: 
              <button 
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                style={{
                  margin: '0 10px',
                  padding: '5px 10px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Clear Data & Reload
              </button>
            </li>
          </ul>
          {this.state.errorInfo && (
            <details style={{ 
              marginTop: '20px', 
              padding: '10px', 
              backgroundColor: '#f8f9fa',
              borderRadius: '5px',
              textAlign: 'left'
            }}>
              <summary>Error Details</summary>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

// Initialize storage on application startup
const initializeApp = async () => {
  try {
    // Initialize cloud sync first
    await cloudSyncService.initCloudSync();
    
    // If we have preloaded cloud data and sync is enabled, use it
    if (hasCloudData && cloudSyncService.isSyncEnabled()) {
      console.log('Using preloaded cloud data');
      const keys = {
        personalInfo: "portfolio_personal_info",
        education: "portfolio_education",
        experience: "portfolio_experience",
        skills: "portfolio_skills",
        projects: "portfolio_projects",
        highlights: "portfolio_highlights",
        pictures: "portfolio_pictures",
        references: "portfolio_references",
        settings: "portfolio_settings"
      };
      
      // Store the cloud data in local storage
      Object.entries(window.CLOUD_PORTFOLIO_DATA).forEach(([section, data]) => {
        const key = keys[section];
        if (key && data) {
          try {
            localStorage.setItem(key, JSON.stringify(data));
            sessionStorage.setItem(key, JSON.stringify(data));
          } catch (err) {
            console.error(`Error saving cloud data for ${section}:`, err);
          }
        }
      });
    }
    
    // Then initialize the portfolio service
    await portfolioService.initializeStorage();
    
    // Create a global backup function to preserve data
    window.backupPortfolioData = () => {
      console.log('Creating manual backup of portfolio data...');
      const data = portfolioService.getAllData();
      
      data.then(portfolioData => {
        // Store with a timestamp
        const timestamp = new Date().toISOString();
        const backup = {
          data: portfolioData,
          timestamp: timestamp
        };
        
        try {
          localStorage.setItem('portfolio_complete_backup', JSON.stringify(backup));
          console.log('Manual backup created successfully at', timestamp);
        } catch (error) {
          console.error('Error creating manual backup:', error);
        }
      });
    };

    // Set up automatic periodic backup every 5 minutes
    const backupInterval = setInterval(() => {
      window.backupPortfolioData();
    }, 5 * 60 * 1000); // 5 minutes

    // Function to restore from backup if needed
    window.restoreFromBackup = () => {
      console.log('Attempting to restore from backup...');
      try {
        const backupStr = localStorage.getItem('portfolio_complete_backup');
        if (backupStr) {
          const backup = JSON.parse(backupStr);
          if (backup && backup.data) {
            // Restore each section
            Object.entries(backup.data).forEach(([key, value]) => {
              if (value) {
                const storageKey = key === 'personalInfo' 
                  ? 'portfolio_personal_info' 
                  : `portfolio_${key}`;
                
                localStorage.setItem(storageKey, JSON.stringify(value));
                sessionStorage.setItem(storageKey, JSON.stringify(value));
                console.log(`Restored ${key} from backup`);
              }
            });
            console.log('Restoration from backup complete');
            return true;
          }
        }
        console.log('No backup found to restore');
        return false;
      } catch (error) {
        console.error('Error restoring from backup:', error);
        return false;
      }
    };

    // Set up hot module replacement (HMR) for development with enhanced protection
    if (import.meta.hot) {
      // Create a full backup before any HMR updates
      import.meta.hot.on('vite:beforeUpdate', () => {
        console.log('HMR update detected - creating data backup...');
        window.backupPortfolioData();
        
        // Get all data from localStorage
        portfolioService.getAllData().then(data => {
          // Make sure everything is also saved in sessionStorage with the correct keys
          Object.entries(data).forEach(([key, value]) => {
            if (value) {
              try {
                // Use the same keys as in the KEYS object in portfolioService.js
                const storageKey = key === 'personalInfo' 
                  ? 'portfolio_personal_info' 
                  : `portfolio_${key}`;
                  
                // Save to sessionStorage
                sessionStorage.setItem(storageKey, JSON.stringify(value));
                
                // Also create individual backups for each key
                const backupKey = `hmr_backup_${storageKey}`;
                const backupData = {
                  data: value,
                  timestamp: new Date().getTime()
                };
                sessionStorage.setItem(backupKey, JSON.stringify(backupData));
              } catch (error) {
                console.error(`Error preserving ${key} data during hot reload:`, error);
              }
            }
          });
        });
      });
      
      // After HMR update completes, verify data integrity
      import.meta.hot.on('vite:afterUpdate', () => {
        console.log('HMR update completed - verifying data integrity...');
        
        // Check if any data was lost and restore from sessionStorage if needed
        setTimeout(() => {
          const keys = [
            'portfolio_personal_info',
            'portfolio_education',
            'portfolio_experience',
            'portfolio_skills',
            'portfolio_projects',
            'portfolio_highlights',
            'portfolio_pictures',
            'portfolio_references',
            'portfolio_settings'
          ];
          
          let dataLost = false;
          
          keys.forEach(key => {
            const localData = localStorage.getItem(key);
            if (!localData) {
              dataLost = true;
              // Try to restore from sessionStorage
              const sessionData = sessionStorage.getItem(key);
              if (sessionData) {
                localStorage.setItem(key, sessionData);
                console.log(`Restored ${key} from sessionStorage after HMR`);
              } else {
                // Try to restore from HMR backup
                const backupKey = `hmr_backup_${key}`;
                const backupData = sessionStorage.getItem(backupKey);
                if (backupData) {
                  try {
                    const parsed = JSON.parse(backupData);
                    if (parsed && parsed.data) {
                      localStorage.setItem(key, JSON.stringify(parsed.data));
                      console.log(`Restored ${key} from HMR backup`);
                    }
                  } catch (error) {
                    console.error(`Error restoring ${key} from HMR backup:`, error);
                  }
                }
              }
            }
          });
          
          if (dataLost) {
            // Force portfolio service to re-initialize if data was lost
            portfolioService.initializeStorage();
            console.log('Data recovery after HMR complete');
          }
        }, 1000); // Wait 1 second after HMR to check and restore
      });
    }

    // Clean up interval on application exit
    window.addEventListener('unload', () => {
      clearInterval(backupInterval);
      // Create one final backup before unloading
      window.backupPortfolioData();
    });

    // Render the application within an error boundary
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Error during app initialization:", error);
    
    // Fallback rendering if initialization fails
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <div style={{ 
        padding: '20px', 
        fontFamily: 'Arial, sans-serif', 
        maxWidth: '800px',
        margin: '40px auto',
        textAlign: 'center'
      }}>
        <h1>Application Failed to Initialize</h1>
        <p>There was a problem loading the application. Please try the following:</p>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          <li>Refresh the page</li>
          <li>Clear your browser cache</li>
          <li>Reset the application data: 
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              style={{
                margin: '0 10px',
                padding: '5px 10px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reset & Reload
            </button>
          </li>
        </ul>
      </div>
    );
  }
};

// Start the application initialization
initializeApp(); 