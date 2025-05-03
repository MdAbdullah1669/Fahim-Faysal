// Local Storage Keys
const KEYS = {
  PERSONAL_INFO: "portfolio_personal_info",
  EDUCATION: "portfolio_education",
  EXPERIENCE: "portfolio_experience",
  SKILLS: "portfolio_skills",
  PROJECTS: "portfolio_projects",
  HIGHLIGHTS: "portfolio_highlights",
  PICTURES: "portfolio_pictures",
  REFERENCES: "portfolio_references",
  SETTINGS: "portfolio_settings",
  PORTFOLIO_VIEWS: "portfolio_views_count",
};

// Import cloud sync service
import cloudSyncService from './cloudSyncService';

// Production data flag - used to check if production data has been loaded
const PRODUCTION_DATA_LOADED = "portfolio_production_data_loaded";

// Cloud sync flag
const CLOUD_SYNC_ENABLED = "portfolio_cloud_sync_enabled";

// Function to save data to localStorage and sessionStorage for persistence
const saveToStorage = (key, data) => {
  try {
    // Convert data to string once to avoid duplication
    const dataString = JSON.stringify(data);

    // Save to localStorage for long-term persistence
    localStorage.setItem(key, dataString);

    // Also save to sessionStorage as a backup during development
    sessionStorage.setItem(key, dataString);

    // Save a timestamp for this key to track when it was last updated
    const timestamp = new Date().getTime();
    localStorage.setItem(`${key}_timestamp`, timestamp.toString());
    sessionStorage.setItem(`${key}_timestamp`, timestamp.toString());

    // Save an additional backup for critical development persistence
    try {
      const backupData = {
        data: data,
        timestamp: timestamp,
      };
      localStorage.setItem(`backup_${key}`, JSON.stringify(backupData));
    } catch (backupError) {
      console.error("Error creating backup:", backupError);
    }
    
    // If cloud sync is enabled, save to cloud as well
    if (cloudSyncService.isSyncEnabled()) {
      // Convert key to section name
      const section = keySectionMapping(key);
      if (section) {
        // Using Promise to avoid blocking the UI
        cloudSyncService.saveToCloud(section, data)
          .then(success => {
            if (success) {
              console.log(`Synced ${section} to cloud successfully`);
            } else {
              console.error(`Failed to sync ${section} to cloud`);
            }
          })
          .catch(error => {
            console.error(`Error syncing ${section} to cloud:`, error);
          });
      }
    }
  } catch (error) {
    console.error("Error saving data to storage:", error);
    // Try to recover from quota exceeded error by clearing less important data
    if (error.name === "QuotaExceededError") {
      tryToFreeUpStorage();
      // Try one more time with just the essential data
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (retryError) {
        console.error("Failed to save data even after cleanup:", retryError);
      }
    }
  }
};

// Helper function to try to free up storage space
const tryToFreeUpStorage = () => {
  try {
    // Find old backup items that can be removed
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        key.startsWith("backup_") &&
        key !== "backup_portfolio_personal_info"
      ) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error("Error while trying to free up storage:", error);
  }
};

// Map storage keys to section names
const keySectionMapping = (key) => {
  switch (key) {
    case KEYS.PERSONAL_INFO:
      return "personalInfo";
    case KEYS.EDUCATION:
      return "education";
    case KEYS.EXPERIENCE:
      return "experience";
    case KEYS.SKILLS:
      return "skills";
    case KEYS.PROJECTS:
      return "projects";
    case KEYS.HIGHLIGHTS:
      return "highlights";
    case KEYS.PICTURES:
      return "pictures";
    case KEYS.REFERENCES:
      return "references";
    case KEYS.SETTINGS:
      return "settings";
    default:
      return null;
  }
};

// Function to get data with fallback between storages
const getFromStorage = async (key, defaultValue) => {
  try {
    // Check if cloud sync is enabled and try to get from cloud first
    if (cloudSyncService.isSyncEnabled()) {
      const section = keySectionMapping(key);
      if (section) {
        const cloudData = await cloudSyncService.fetchFromCloud(section);
        if (cloudData) {
          // Save cloud data to local storage to keep things in sync
          saveToStorage(key, cloudData);
          return cloudData;
        }
      }
    }

    // Try localStorage first
    const localData = localStorage.getItem(key);
    if (localData) {
      try {
        return JSON.parse(localData);
      } catch (parseError) {
        console.error(
          `Error parsing data from localStorage for key ${key}:`,
          parseError
        );
      }
    }

    // Try sessionStorage if localStorage is empty or invalid
    const sessionData = sessionStorage.getItem(key);
    if (sessionData) {
      try {
        const parsedData = JSON.parse(sessionData);
        // If data exists in sessionStorage but not localStorage, restore it
        localStorage.setItem(key, sessionData);
        return parsedData;
      } catch (parseError) {
        console.error(
          `Error parsing data from sessionStorage for key ${key}:`,
          parseError
        );
      }
    }

    // Try the backup storage as a last resort
    const backupData = localStorage.getItem(`backup_${key}`);
    if (backupData) {
      try {
        const parsedBackup = JSON.parse(backupData);
        if (parsedBackup && parsedBackup.data) {
          console.log(`Recovering data for ${key} from backup storage`);
          // Restore from backup to primary storage
          const restoredData = parsedBackup.data;
          saveToStorage(key, restoredData);
          return restoredData;
        }
      } catch (parseError) {
        console.error(`Error parsing backup data for key ${key}:`, parseError);
      }
    }

    // Return default if no valid data is found
    return defaultValue;
  } catch (error) {
    console.error("Error retrieving data from storage:", error);
    return defaultValue;
  }
};

// Initial default data
const defaultData = {
  personalInfo: {
    name: "Fahim Faysal",
    jobTitle: "Web Developer",
    introText:
      "Passionate web developer with expertise in React and modern web technologies.",
    bio: "I am a full-stack developer with over 5 years of experience building web applications.",
    email: "example@example.com",
    phone: "+1234567890",
    location: "Dhaka, Bangladesh",
    website: "https://example.com",
    aboutImageUrl: null,
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/fahim-faysal-6a6425253",
      github: "https://github.com/example",
      twitter: "https://twitter.com/example",
      instagram: "https://instagram.com/example",
    },
    hero: {
      greeting: "Hello, I'm",
      description:
        "Passionate web developer with expertise in React and modern web technologies. I create responsive and user-friendly web applications.",
      stats: [
        { value: "5+", label: "Years Experience" },
        { value: "100+", label: "Projects Completed" },
        { value: "50+", label: "Happy Clients" },
      ],
      buttonText: "Get In Touch",
      profileImageUrl: null,
    },
  },
  education: [
    {
      degree: "Bachelor of Computer Science",
      field: "Software Engineering",
      institution: "Example University",
      location: "Dhaka, Bangladesh",
      startDate: "2018-09",
      endDate: "2022-06",
      current: false,
      description:
        "Studied computer science with focus on software engineering and web development. Participated in several coding competitions and hackathons.",
    },
  ],
  experience: [
    {
      position: "Senior Full Stack Developer",
      company: "Tech Innovations Inc.",
      location: "San Francisco, CA",
      period: "2021 - Present",
      description:
        "Lead developer for multiple enterprise-level web applications. Managed a team of five developers and collaborated with design and product teams.",
    },
  ],
  skills: {
    technical: [
      { name: "React", level: "advanced" },
      { name: "HTML", level: "expert" },
      { name: "CSS", level: "expert" },
      { name: "JavaScript", level: "advanced" },
      { name: "Node.js", level: "intermediate" },
    ],
    soft: [
      { name: "Communication" },
      { name: "Teamwork" },
      { name: "Problem Solving" },
    ],
    languages: [
      { name: "Bengali", level: "native" },
      { name: "English", level: "advanced" },
      { name: "Spanish", level: "elementary" },
    ],
  },
  projects: [
    {
      title: "Personal Portfolio",
      category: "Web Development",
      description:
        "A responsive portfolio website built with React and modern CSS. Features include a clean design, smooth animations, and a custom admin panel for easy content management.",
      image: null,
      demoUrl: "https://example.com/portfolio",
      repoUrl: "https://github.com/username/portfolio",
      date: "2023-03",
      technologies: "React, CSS Modules, React Router",
    },
  ],
  highlights: [
    {
      title: "Best Web Application Award",
      date: "2023-05",
      category: "award",
      description:
        "Received industry recognition for developing an innovative user interface that increased customer engagement by 45%.",
    },
  ],
  pictures: [
    {
      title: "Mountain Sunrise",
      category: "Landscape",
      image: null,
      description:
        "Breathtaking sunrise captured from the summit of Mount Rainier during a hiking expedition.",
      link: "#",
    },
  ],
  references: [
    {
      name: "Sarah Johnson",
      position: "CTO at Tech Innovations",
      company: "Tech Innovations Inc.",
      image: null,
      quote:
        "John is an exceptional developer who consistently delivered high-quality work on all of our projects. His technical skills, problem-solving abilities, and communication made him an invaluable asset to our team.",
    },
  ],
  settings: {
    portfolioTitle: "John Doe - Full Stack Developer",
    faviconUrl: "/favicon.ico",
    accentColor: "#00bcd4",
    secondaryColor: "#7986cb",
    metaDescription:
      "Portfolio of John Doe, a Full Stack Developer specializing in React, Node.js, and modern web technologies.",
    auth: {
      username: "admin",
      email: "admin@example.com",
      passwordHash: "MTIzNA==", // Base64 encoded "1234"
    },
  },
};

// Validate all social media links in the portfolio data
const validateAllLinks = () => {
  try {
    console.log("Validating all social media links...");

    // Get personal info data
    const personalInfo = getFromStorage(
      KEYS.PERSONAL_INFO,
      defaultData.personalInfo
    );
    let needsUpdate = false;

    // Validate social links
    if (personalInfo && personalInfo.socialLinks) {
      for (const [platform, url] of Object.entries(personalInfo.socialLinks)) {
        if (url && typeof url === "string" && !url.startsWith("https://")) {
          personalInfo.socialLinks[platform] = "https://" + url;
          needsUpdate = true;
        }
      }
    }

    // Save if changes were made
    if (needsUpdate) {
      saveToStorage(KEYS.PERSONAL_INFO, personalInfo);
      dispatchLocalDataChanged("portfolio_personal_info");
      console.log("Social media links validated and updated");
    } else {
      console.log("All social media links are already valid");
    }

    return true;
  } catch (error) {
    console.error("Error validating links:", error);
    return false;
  }
};

// Initialize local storage with default data if not already present
const initializeStorage = async () => {
  console.log("Initializing storage and checking for existing data...");

  try {
    // First, initialize cloud sync with timeout protection
    const cloudSyncPromise = cloudSyncService.initCloudSync();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Cloud sync initialization timed out')), 5000);
    });
    
    try {
      await Promise.race([cloudSyncPromise, timeoutPromise]);
    } catch (syncError) {
      console.error("Error initializing cloud sync with timeout:", syncError);
      // Continue with local data even if cloud sync fails
    }
    
    // Check if we're in production environment (Netlify)
    const isProduction = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
    
    // Check if we've already loaded production data
    const productionDataLoaded = localStorage.getItem(PRODUCTION_DATA_LOADED);
    
    // Use potential preloaded cloud data if available (from index.html script)
    const hasPreloadedCloudData = window.CLOUD_PORTFOLIO_DATA && 
                              typeof window.CLOUD_PORTFOLIO_DATA === 'object' && 
                              Object.keys(window.CLOUD_PORTFOLIO_DATA).length > 0;
    
    // If in production and production data hasn't been loaded yet, initialize with production data
    if (isProduction && !productionDataLoaded) {
      console.log("Production environment detected. Loading production data...");
      
      try {
        // Load production data if available (from window object)
        if (window.PORTFOLIO_PRODUCTION_DATA) {
          const productionData = window.PORTFOLIO_PRODUCTION_DATA;
          
          // Save all sections from production data
          if (productionData.personalInfo) saveToStorage(KEYS.PERSONAL_INFO, productionData.personalInfo);
          if (productionData.education) saveToStorage(KEYS.EDUCATION, productionData.education);
          if (productionData.experience) saveToStorage(KEYS.EXPERIENCE, productionData.experience);
          if (productionData.skills) saveToStorage(KEYS.SKILLS, productionData.skills);
          if (productionData.projects) saveToStorage(KEYS.PROJECTS, productionData.projects);
          if (productionData.highlights) saveToStorage(KEYS.HIGHLIGHTS, productionData.highlights);
          if (productionData.pictures) saveToStorage(KEYS.PICTURES, productionData.pictures);
          if (productionData.references) saveToStorage(KEYS.REFERENCES, productionData.references);
          if (productionData.settings) saveToStorage(KEYS.SETTINGS, productionData.settings);
          
          // Mark that we've loaded production data
          localStorage.setItem(PRODUCTION_DATA_LOADED, "true");
          console.log("Production data loaded successfully");
          
          // If cloud sync is enabled, initialize cloud data as well
          if (cloudSyncService.isSyncEnabled()) {
            try {
              const success = await cloudSyncService.initializeCloudData(productionData);
              if (success) {
                console.log("Initialized cloud data with production data");
              } else {
                console.warn("Failed to initialize cloud data");
              }
            } catch (error) {
              console.error("Error initializing cloud data:", error);
            }
          }
          
          return;
        }
      } catch (error) {
        console.error("Error loading production data:", error);
      }
    } else if (hasPreloadedCloudData && cloudSyncService.isSyncEnabled()) {
      // If we have preloaded cloud data from index.html script, use it
      console.log("Using preloaded cloud data from initial page load");
      try {
        const cloudData = window.CLOUD_PORTFOLIO_DATA;
        
        // Store the cloud data locally
        if (cloudData.personalInfo) saveToStorage(KEYS.PERSONAL_INFO, cloudData.personalInfo);
        if (cloudData.education) saveToStorage(KEYS.EDUCATION, cloudData.education);
        if (cloudData.experience) saveToStorage(KEYS.EXPERIENCE, cloudData.experience);
        if (cloudData.skills) saveToStorage(KEYS.SKILLS, cloudData.skills);
        if (cloudData.projects) saveToStorage(KEYS.PROJECTS, cloudData.projects);
        if (cloudData.highlights) saveToStorage(KEYS.HIGHLIGHTS, cloudData.highlights);
        if (cloudData.pictures) saveToStorage(KEYS.PICTURES, cloudData.pictures);
        if (cloudData.references) saveToStorage(KEYS.REFERENCES, cloudData.references);
        if (cloudData.settings) saveToStorage(KEYS.SETTINGS, cloudData.settings);
        
        console.log("Preloaded cloud data synchronized to local storage");
        return;
      } catch (error) {
        console.error("Error using preloaded cloud data:", error);
      }
    } else if (cloudSyncService.isSyncEnabled()) {
      // If cloud sync is enabled, try to load data from cloud
      try {
        console.log("Cloud sync enabled. Attempting to load data from cloud...");
        
        // Set a timeout for cloud data loading
        const cloudDataPromise = cloudSyncService.getAllFromCloud();
        const cloudTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Cloud data fetch timed out')), 5000);
        });
        
        const cloudData = await Promise.race([cloudDataPromise, cloudTimeoutPromise]);
        
        if (cloudData && Object.keys(cloudData).length > 0) {
          console.log("Successfully loaded data from cloud");
          
          // Store the cloud data locally
          if (cloudData.personalInfo) saveToStorage(KEYS.PERSONAL_INFO, cloudData.personalInfo);
          if (cloudData.education) saveToStorage(KEYS.EDUCATION, cloudData.education);
          if (cloudData.experience) saveToStorage(KEYS.EXPERIENCE, cloudData.experience);
          if (cloudData.skills) saveToStorage(KEYS.SKILLS, cloudData.skills);
          if (cloudData.projects) saveToStorage(KEYS.PROJECTS, cloudData.projects);
          if (cloudData.highlights) saveToStorage(KEYS.HIGHLIGHTS, cloudData.highlights);
          if (cloudData.pictures) saveToStorage(KEYS.PICTURES, cloudData.pictures);
          if (cloudData.references) saveToStorage(KEYS.REFERENCES, cloudData.references);
          if (cloudData.settings) saveToStorage(KEYS.SETTINGS, cloudData.settings);
          
          console.log("Cloud data synchronized to local storage");
          return;
        } else {
          console.log("No data found in cloud storage. Using local data.");
          
          // Initialize cloud with local data
          try {
            const localData = await getAllData();
            const success = await cloudSyncService.initializeCloudData(localData);
            if (success) {
              console.log("Initialized cloud data with local data");
            } else {
              console.warn("Failed to initialize cloud data with local data");
            }
          } catch (error) {
            console.error("Error initializing cloud data:", error);
          }
        }
      } catch (error) {
        console.error("Error loading data from cloud:", error);
        console.log("Continuing with local data initialization...");
      }
    }
  } catch (error) {
    console.error("Critical error during storage initialization:", error);
    // Continue with local data initialization even if there was an error
  }

  // Validate all existing links
  validateAllLinks();

  // Check for data in all storage locations and use the most recent
  const checkDataExists = (key, defaultData) => {
    // Check primary localStorage
    const localData = localStorage.getItem(key);
    const localTimestamp = localStorage.getItem(`${key}_timestamp`);

    // Check sessionStorage
    const sessionData = sessionStorage.getItem(key);
    const sessionTimestamp = sessionStorage.getItem(`${key}_timestamp`);

    // Check backup storage
    const backupStorage = localStorage.getItem(`backup_${key}`);
    let backupData = null;
    let backupTimestamp = null;

    if (backupStorage) {
      try {
        const parsedBackup = JSON.parse(backupStorage);
        if (parsedBackup && parsedBackup.data) {
          backupData = parsedBackup.data;
          backupTimestamp = parsedBackup.timestamp;
        }
      } catch (error) {
        console.error(`Error parsing backup data for ${key}:`, error);
      }
    }

    // Compare timestamps and use the most recent data
    if (localData && sessionData && backupData) {
      // All three exist, compare timestamps
      const localTime = parseInt(localTimestamp || "0");
      const sessionTime = parseInt(sessionTimestamp || "0");
      const backupTime = backupTimestamp || 0;

      if (localTime >= sessionTime && localTime >= backupTime) {
        return true; // localStorage is most recent
      } else if (sessionTime >= localTime && sessionTime >= backupTime) {
        // sessionStorage is most recent, restore to localStorage
        try {
          localStorage.setItem(key, sessionData);
          return true;
        } catch (error) {
          console.error(
            `Error restoring session data to localStorage for ${key}:`,
            error
          );
        }
      } else {
        // backup is most recent, restore to both storages
        try {
          const backupStr = JSON.stringify(backupData);
          localStorage.setItem(key, backupStr);
          sessionStorage.setItem(key, backupStr);
          return true;
        } catch (error) {
          console.error(
            `Error restoring backup data to storages for ${key}:`,
            error
          );
        }
      }
    } else if (localData) {
      return true; // localStorage exists
    } else if (sessionData) {
      // Only sessionStorage exists, restore to localStorage
      try {
        localStorage.setItem(key, sessionData);
        return true;
      } catch (error) {
        console.error(
          `Error restoring session data to localStorage for ${key}:`,
          error
        );
      }
    } else if (backupData) {
      // Only backup exists, restore to both storages
      try {
        const backupStr = JSON.stringify(backupData);
        localStorage.setItem(key, backupStr);
        sessionStorage.setItem(key, backupStr);
        return true;
      } catch (error) {
        console.error(
          `Error restoring backup data to storages for ${key}:`,
          error
        );
      }
    }

    // No valid data found
    return false;
  };

  // Personal Info
  if (!checkDataExists(KEYS.PERSONAL_INFO, defaultData.personalInfo)) {
    saveToStorage(KEYS.PERSONAL_INFO, defaultData.personalInfo);
  }

  // Education
  if (!checkDataExists(KEYS.EDUCATION, defaultData.education)) {
    saveToStorage(KEYS.EDUCATION, defaultData.education);
  }

  // Experience
  if (!checkDataExists(KEYS.EXPERIENCE, defaultData.experience)) {
    saveToStorage(KEYS.EXPERIENCE, defaultData.experience);
  }

  // Skills
  if (!checkDataExists(KEYS.SKILLS, defaultData.skills)) {
    saveToStorage(KEYS.SKILLS, defaultData.skills);
  }

  // Projects
  if (!checkDataExists(KEYS.PROJECTS, defaultData.projects)) {
    saveToStorage(KEYS.PROJECTS, defaultData.projects);
  }

  // Highlights
  if (!checkDataExists(KEYS.HIGHLIGHTS, defaultData.highlights)) {
    saveToStorage(KEYS.HIGHLIGHTS, defaultData.highlights);
  }

  // Pictures
  if (!checkDataExists(KEYS.PICTURES, defaultData.pictures)) {
    saveToStorage(KEYS.PICTURES, defaultData.pictures);
  }

  // References
  if (!checkDataExists(KEYS.REFERENCES, defaultData.references)) {
    saveToStorage(KEYS.REFERENCES, defaultData.references);
  }

  // Settings
  if (!checkDataExists(KEYS.SETTINGS, defaultData.settings)) {
    saveToStorage(KEYS.SETTINGS, defaultData.settings);
  }

  console.log("Storage initialization complete");
};

// Get all portfolio data with robust error handling
const getAllData = async () => {
  try {
    // Safely check if cloud sync is enabled
    let cloudSyncIsEnabled = false;
    try {
      if (typeof cloudSyncService === 'object' && 
          typeof cloudSyncService.isSyncEnabled === 'function') {
        cloudSyncIsEnabled = cloudSyncService.isSyncEnabled();
      }
    } catch (syncError) {
      console.error("Error checking cloud sync status:", syncError);
      cloudSyncIsEnabled = false;
    }
  
    // Try to get data from cloud if sync is enabled
    if (cloudSyncIsEnabled) {
      try {
        const cloudData = await cloudSyncService.getAllFromCloud();
        if (cloudData && Object.keys(cloudData).length > 0) {
          return cloudData;
        }
      } catch (cloudError) {
        console.error("Error fetching data from cloud:", cloudError);
        // Continue to local storage fallback
      }
    }
    
    // Fall back to local storage with extra safety
    const result = {};
    
    // Helper to safely get data from storage
    const safeGetFromStorage = async (key, defaultVal) => {
      try {
        return await getFromStorage(key, defaultVal);
      } catch (error) {
        console.error(`Error getting ${key} from storage:`, error);
        return defaultVal;
      }
    };
    
    // Get all sections with safety
    result.personalInfo = await safeGetFromStorage(KEYS.PERSONAL_INFO, defaultData.personalInfo);
    result.education = await safeGetFromStorage(KEYS.EDUCATION, defaultData.education);
    result.experience = await safeGetFromStorage(KEYS.EXPERIENCE, defaultData.experience);
    result.skills = await safeGetFromStorage(KEYS.SKILLS, defaultData.skills);
    result.projects = await safeGetFromStorage(KEYS.PROJECTS, defaultData.projects);
    result.highlights = await safeGetFromStorage(KEYS.HIGHLIGHTS, defaultData.highlights);
    result.pictures = await safeGetFromStorage(KEYS.PICTURES, defaultData.pictures);
    result.references = await safeGetFromStorage(KEYS.REFERENCES, defaultData.references);
    result.settings = await safeGetFromStorage(KEYS.SETTINGS, defaultData.settings);
    
    return result;
  } catch (error) {
    console.error("Critical error in getAllData:", error);
    // Return default data as a last resort
    return {
      personalInfo: defaultData.personalInfo,
      education: defaultData.education,
      experience: defaultData.experience,
      skills: defaultData.skills,
      projects: defaultData.projects,
      highlights: defaultData.highlights,
      pictures: defaultData.pictures,
      references: defaultData.references,
      settings: defaultData.settings,
    };
  }
};

// Get section data
const getSectionData = async (section) => {
  switch (section) {
    case "personalInfo":
    case "personal": // Add alias for backward compatibility
      return await getFromStorage(KEYS.PERSONAL_INFO, defaultData.personalInfo);
    case "education":
      return await getFromStorage(KEYS.EDUCATION, defaultData.education);
    case "experience":
      return await getFromStorage(KEYS.EXPERIENCE, defaultData.experience);
    case "skills":
      return await getFromStorage(KEYS.SKILLS, defaultData.skills);
    case "projects":
      return await getFromStorage(KEYS.PROJECTS, defaultData.projects);
    case "highlights":
      return await getFromStorage(KEYS.HIGHLIGHTS, defaultData.highlights);
    case "pictures":
      return await getFromStorage(KEYS.PICTURES, defaultData.pictures);
    case "references":
      return await getFromStorage(KEYS.REFERENCES, defaultData.references);
    case "settings":
      return await getFromStorage(KEYS.SETTINGS, defaultData.settings);
    default:
      return null;
  }
};

// Save section data
const saveSectionData = (section, data) => {
  // Validate social media links when saving personal info
  if (
    (section === "personalInfo" || section === "personal") &&
    data.socialLinks
  ) {
    for (const [platform, url] of Object.entries(data.socialLinks)) {
      if (url && typeof url === "string" && !url.startsWith("https://")) {
        data.socialLinks[platform] = "https://" + url;
      }
    }
  }

  switch (section) {
    case "personalInfo":
    case "personal":
      saveToStorage(KEYS.PERSONAL_INFO, data);
      // Dispatch event to notify about data change
      dispatchLocalDataChanged("portfolio_personal_info");
      break;
    case "education":
      saveToStorage(KEYS.EDUCATION, data);
      dispatchLocalDataChanged("portfolio_education");
      break;
    case "experience":
      saveToStorage(KEYS.EXPERIENCE, data);
      dispatchLocalDataChanged("portfolio_experience");
      break;
    case "skills":
      saveToStorage(KEYS.SKILLS, data);
      dispatchLocalDataChanged("portfolio_skills");
      break;
    case "projects":
      saveToStorage(KEYS.PROJECTS, data);
      dispatchLocalDataChanged("portfolio_projects");
      break;
    case "highlights":
      saveToStorage(KEYS.HIGHLIGHTS, data);
      dispatchLocalDataChanged("portfolio_highlights");
      break;
    case "pictures":
      saveToStorage(KEYS.PICTURES, data);
      dispatchLocalDataChanged("portfolio_pictures");
      break;
    case "references":
      saveToStorage(KEYS.REFERENCES, data);
      dispatchLocalDataChanged("portfolio_references");
      break;
    case "settings":
      saveToStorage(KEYS.SETTINGS, data);
      dispatchLocalDataChanged("portfolio_settings");
      break;
    default:
      return false;
  }

  return true;
};

// Helper function to dispatch a custom event for in-window updates
const dispatchLocalDataChanged = (key) => {
  try {
    const event = new CustomEvent("localDataChanged", { detail: { key } });
    window.dispatchEvent(event);
    console.log(`Dispatched localDataChanged event for key: ${key}`);
  } catch (error) {
    console.error("Error dispatching localDataChanged event:", error);
  }
};

// Clear all data
const clearAllData = () => {
  Object.values(KEYS).forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  localStorage.removeItem("portfolio_recent_activity");
  sessionStorage.removeItem("portfolio_recent_activity");
};

// Reset to default data
const resetToDefault = () => {
  // Clear all existing data first
  clearAllData();

  // Save default data using the new storage functions
  saveToStorage(KEYS.PERSONAL_INFO, defaultData.personalInfo);
  saveToStorage(KEYS.EDUCATION, defaultData.education);
  saveToStorage(KEYS.EXPERIENCE, defaultData.experience);
  saveToStorage(KEYS.SKILLS, defaultData.skills);
  saveToStorage(KEYS.PROJECTS, defaultData.projects);
  saveToStorage(KEYS.HIGHLIGHTS, defaultData.highlights);
  saveToStorage(KEYS.PICTURES, defaultData.pictures);
  saveToStorage(KEYS.REFERENCES, defaultData.references);
  saveToStorage(KEYS.SETTINGS, defaultData.settings);

  // Return success
  return true;
};

// Get portfolio views count
const getPortfolioViews = () => {
  try {
    // Try localStorage first
    const views = localStorage.getItem(KEYS.PORTFOLIO_VIEWS);
    if (views) {
      return parseInt(views) || 0;
    }

    // Try sessionStorage if localStorage is empty
    const sessionViews = sessionStorage.getItem(KEYS.PORTFOLIO_VIEWS);
    if (sessionViews) {
      // If views exist in sessionStorage but not localStorage, restore it
      localStorage.setItem(KEYS.PORTFOLIO_VIEWS, sessionViews);
      return parseInt(sessionViews) || 0;
    }

    // Default to 0 if neither exists
    return 0;
  } catch (error) {
    console.error("Error retrieving portfolio views:", error);
    return 0;
  }
};

// Increment portfolio views count
const incrementPortfolioViews = () => {
  const currentViews = getPortfolioViews();
  const newViews = currentViews + 1;
  localStorage.setItem(KEYS.PORTFOLIO_VIEWS, newViews.toString());
  return newViews;
};

// Debug functions to help troubleshoot data issues
const debugPortfolioData = () => {
  try {
    console.group("Portfolio Data Debug");

    // Check personal info with hero image
    const personalInfo = getFromStorage(KEYS.PERSONAL_INFO, null);
    console.log("Personal Info from storage:", personalInfo);

    if (personalInfo && personalInfo.hero) {
      console.log("Hero object exists:", personalInfo.hero);
      console.log("Hero profile image URL:", personalInfo.hero.profileImageUrl);
    } else {
      console.log("Hero object missing or incomplete");
    }

    // Check all storage mechanisms for personal info
    console.group("Storage Check");
    const localData = localStorage.getItem(KEYS.PERSONAL_INFO);
    console.log("localStorage data exists:", !!localData);

    const sessionData = sessionStorage.getItem(KEYS.PERSONAL_INFO);
    console.log("sessionStorage data exists:", !!sessionData);

    const backupData = localStorage.getItem(`backup_${KEYS.PERSONAL_INFO}`);
    console.log("backup data exists:", !!backupData);
    console.groupEnd();

    console.groupEnd();
    return { localData, sessionData, backupData, personalInfo };
  } catch (error) {
    console.error("Error in debug function:", error);
    return null;
  }
};

// Fix hero image data if it's missing
const fixHeroImageData = (imageUrl) => {
  try {
    console.log("Attempting to fix hero image data...");

    // Get current personal info
    const personalInfo = getFromStorage(
      KEYS.PERSONAL_INFO,
      defaultData.personalInfo
    );
    console.log("Current personal info:", personalInfo);

    // Ensure hero object exists
    if (!personalInfo.hero) {
      personalInfo.hero = {
        greeting: "Hello, I'm",
        description: personalInfo.introText || "",
        stats: [
          { value: "5+", label: "Years Experience" },
          { value: "100+", label: "Projects Completed" },
          { value: "50+", label: "Happy Clients" },
        ],
        buttonText: "Get In Touch",
        profileImageUrl: null,
      };
    }

    // Set the image URL
    personalInfo.hero.profileImageUrl = imageUrl;
    console.log("Updated personal info with new image URL:", personalInfo);

    // Save the updated personal info
    saveToStorage(KEYS.PERSONAL_INFO, personalInfo);
    dispatchLocalDataChanged("portfolio_personal_info");

    console.log("Hero image data fixed successfully!");
    return true;
  } catch (error) {
    console.error("Error fixing hero image data:", error);
    return false;
  }
};

// Check if cloud sync is enabled with proper error handling
const isCloudSyncEnabled = () => {
  try {
    if (typeof cloudSyncService === 'object' && 
        typeof cloudSyncService.isSyncEnabled === 'function') {
      return cloudSyncService.isSyncEnabled();
    }
    return false;
  } catch (error) {
    console.error("Error checking cloud sync status:", error);
    return false;
  }
};

// Toggle cloud sync with error handling
const toggleCloudSync = async (enabled) => {
  try {
    if (typeof cloudSyncService !== 'object' || 
        typeof cloudSyncService.toggleSyncEnabled !== 'function') {
      console.error("Cloud sync service not available");
      return false;
    }
    
    // Toggle sync in the cloud service
    const success = await cloudSyncService.toggleSyncEnabled(enabled);
    
    if (success) {
      // Save to local storage for persistent setting
      try {
        localStorage.setItem(CLOUD_SYNC_ENABLED, enabled.toString());
      } catch (storageError) {
        console.error("Error saving sync setting to storage:", storageError);
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error toggling cloud sync:", error);
    return false;
  }
};

// Sync local data to cloud with error handling
const syncLocalToCloud = async () => {
  try {
    if (!isCloudSyncEnabled()) {
      console.warn("Cannot sync to cloud: cloud sync is disabled");
      return false;
    }
    
    if (typeof cloudSyncService !== 'object' || 
        typeof cloudSyncService.initializeCloudData !== 'function') {
      console.error("Cloud sync service not available");
      return false;
    }
    
    // Get all data from local storage first
    const allData = await getAllData();
    
    // Send to cloud
    return await cloudSyncService.initializeCloudData(allData);
  } catch (error) {
    console.error("Error syncing local data to cloud:", error);
    return false;
  }
};

// Sync data from cloud to local with error handling
const syncCloudToLocal = async () => {
  try {
    if (!isCloudSyncEnabled()) {
      console.warn("Cannot sync from cloud: cloud sync is disabled");
      return false;
    }
    
    if (typeof cloudSyncService !== 'object' || 
        typeof cloudSyncService.getAllFromCloud !== 'function') {
      console.error("Cloud sync service not available");
      return false;
    }
    
    // Get data from cloud
    const cloudData = await cloudSyncService.getAllFromCloud();
    
    if (!cloudData || Object.keys(cloudData).length === 0) {
      console.warn("No data available from cloud");
      return false;
    }
    
    // Save all sections to local storage
    let success = false;
    
    // Helper to safely save data
    const safeSaveToStorage = async (key, data) => {
      if (!data) return false;
      try {
        await saveToStorage(key, data);
        return true;
      } catch (error) {
        console.error(`Error saving ${key} to storage:`, error);
        return false;
      }
    };
    
    // Process each section
    if (cloudData.personalInfo) {
      success = await safeSaveToStorage(KEYS.PERSONAL_INFO, cloudData.personalInfo) || success;
    }
    
    if (cloudData.education) {
      success = await safeSaveToStorage(KEYS.EDUCATION, cloudData.education) || success;
    }
    
    if (cloudData.experience) {
      success = await safeSaveToStorage(KEYS.EXPERIENCE, cloudData.experience) || success;
    }
    
    if (cloudData.skills) {
      success = await safeSaveToStorage(KEYS.SKILLS, cloudData.skills) || success;
    }
    
    if (cloudData.projects) {
      success = await safeSaveToStorage(KEYS.PROJECTS, cloudData.projects) || success;
    }
    
    if (cloudData.highlights) {
      success = await safeSaveToStorage(KEYS.HIGHLIGHTS, cloudData.highlights) || success;
    }
    
    if (cloudData.pictures) {
      success = await safeSaveToStorage(KEYS.PICTURES, cloudData.pictures) || success;
    }
    
    if (cloudData.references) {
      success = await safeSaveToStorage(KEYS.REFERENCES, cloudData.references) || success;
    }
    
    if (cloudData.settings) {
      success = await safeSaveToStorage(KEYS.SETTINGS, cloudData.settings) || success;
    }
    
    // Dispatch event to notify components of data change
    if (success) {
      try {
        dispatchLocalDataChanged();
      } catch (eventError) {
        console.error("Error dispatching data change event:", eventError);
      }
    }
    
    return success;
  } catch (error) {
    console.error("Error syncing cloud data to local:", error);
    return false;
  }
};

// Export all functions
const portfolioService = {
  initializeStorage,
  getAllData,
  getSectionData,
  saveSectionData,
  clearAllData,
  resetToDefault,
  dispatchLocalDataChanged,
  getPortfolioViews,
  incrementPortfolioViews,
  debugPortfolioData,
  fixHeroImageData,
  validateAllLinks,
  // Cloud sync functions
  isCloudSyncEnabled,
  toggleCloudSync,
  syncLocalToCloud,
  syncCloudToLocal
};

export default portfolioService;
