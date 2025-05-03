// Cloud storage for real-time data sync between dashboard and portfolio
const STORAGE_URL = "https://api.jsonbin.io/v3/b";
const API_KEY = "$2a$10$iYxZUCDpdRLqm2EGZbXBzeR2QJo9.cqEgdVxzl.IUVLygRp/YYGjm"; // Free API key for demonstration
const COLLECTION_ID = "65f67a3b266cfc3fde8e7c16"; // Collection for portfolio data

// Private bin IDs for each section
const BIN_IDS = {
  PERSONAL_INFO: "65f67a5c266cfc3fde8e7c2c",
  EDUCATION: "65f67a6d266cfc3fde8e7c4c",
  EXPERIENCE: "65f67a7b266cfc3fde8e7c5c",
  SKILLS: "65f67a85266cfc3fde8e7c6c",
  PROJECTS: "65f67a91266cfc3fde8e7c7c",
  HIGHLIGHTS: "65f67a9c266cfc3fde8e7c8c",
  PICTURES: "65f67aa7266cfc3fde8e7c9c",
  REFERENCES: "65f67ab2266cfc3fde8e7cac",
  SETTINGS: "65f67abd266cfc3fde8e7cbb",
  SYNC_STATUS: "65f67ac8266cfc3fde8e7cc7"
};

// Cache for data to minimize API calls
const dataCache = {};
let syncEnabled = false;

// Initialize cloud sync
const initCloudSync = async () => {
  try {
    console.log("Initializing cloud sync service...");
    
    // Set a timeout to avoid hanging if the API is not responsive
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Cloud sync initialization timed out')), 5000);
    });
    
    try {
      // Check if sync is enabled with a timeout
      const syncStatusPromise = fetchSyncStatus();
      const syncStatus = await Promise.race([syncStatusPromise, timeoutPromise]);
      
      // Default to disabled if there's an issue
      syncEnabled = syncStatus?.enabled || false;
      
      console.log(`Cloud sync ${syncEnabled ? 'enabled' : 'disabled'}`);
      return syncEnabled;
    } catch (fetchError) {
      console.error("Error fetching sync status:", fetchError);
      // Default to disabled if we couldn't determine the status
      syncEnabled = false;
      return false;
    }
  } catch (error) {
    console.error("Error initializing cloud sync:", error);
    // Ensure sync is disabled on error
    syncEnabled = false;
    return false;
  }
};

// Get sync status
const fetchSyncStatus = async () => {
  try {
    const response = await fetch(`${STORAGE_URL}/${BIN_IDS.SYNC_STATUS}`, {
      method: 'GET',
      headers: {
        'X-Master-Key': API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sync status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.record;
  } catch (error) {
    console.error("Error fetching sync status:", error);
    return { enabled: false };
  }
};

// Toggle sync enabled/disabled
const toggleSyncEnabled = async (enabled) => {
  try {
    const response = await fetch(`${STORAGE_URL}/${BIN_IDS.SYNC_STATUS}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY
      },
      body: JSON.stringify({ enabled })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update sync status: ${response.status}`);
    }
    
    syncEnabled = enabled;
    return true;
  } catch (error) {
    console.error("Error updating sync status:", error);
    return false;
  }
};

// Get data from cloud storage
const fetchFromCloud = async (section) => {
  if (!syncEnabled) return null;
  
  const binId = getBinIdForSection(section);
  if (!binId) return null;
  
  try {
    // Check cache first
    if (dataCache[section]) {
      return dataCache[section];
    }
    
    const response = await fetch(`${STORAGE_URL}/${binId}`, {
      method: 'GET',
      headers: {
        'X-Master-Key': API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Update cache
    dataCache[section] = data.record;
    return data.record;
  } catch (error) {
    console.error(`Error fetching ${section} from cloud:`, error);
    return null;
  }
};

// Save data to cloud storage
const saveToCloud = async (section, data) => {
  if (!syncEnabled) return false;
  
  const binId = getBinIdForSection(section);
  if (!binId) return false;
  
  try {
    const response = await fetch(`${STORAGE_URL}/${binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save data: ${response.status}`);
    }
    
    // Update cache
    dataCache[section] = data;
    return true;
  } catch (error) {
    console.error(`Error saving ${section} to cloud:`, error);
    return false;
  }
};

// Get all data from cloud
const getAllFromCloud = async () => {
  if (!syncEnabled) return null;
  
  try {
    const sections = [
      "personalInfo",
      "education",
      "experience",
      "skills",
      "projects",
      "highlights",
      "pictures",
      "references",
      "settings"
    ];
    
    const portfolio = {};
    
    // Fetch all sections in parallel
    await Promise.all(sections.map(async (section) => {
      try {
        const data = await fetchFromCloud(section);
        if (data) {
          portfolio[section] = data;
        }
      } catch (sectionError) {
        console.error(`Error fetching ${section}:`, sectionError);
        // Continue with other sections even if one fails
      }
    }));
    
    return portfolio;
  } catch (error) {
    console.error("Error fetching all data from cloud:", error);
    return null;
  }
};

// Initialize all data in cloud storage
const initializeCloudData = async (allData) => {
  if (!syncEnabled) return false;
  
  try {
    const sections = [
      { key: "personalInfo", data: allData.personalInfo },
      { key: "education", data: allData.education },
      { key: "experience", data: allData.experience },
      { key: "skills", data: allData.skills },
      { key: "projects", data: allData.projects },
      { key: "highlights", data: allData.highlights },
      { key: "pictures", data: allData.pictures },
      { key: "references", data: allData.references },
      { key: "settings", data: allData.settings }
    ];
    
    // Save all sections in parallel
    const results = await Promise.allSettled(sections.map(async ({ key, data }) => {
      if (!data) return { key, success: false, reason: "No data provided" };
      
      try {
        const success = await saveToCloud(key, data);
        return { key, success };
      } catch (error) {
        return { key, success: false, reason: error.message };
      }
    }));
    
    // Log results for debugging
    results.forEach(result => {
      if (result.value.success) {
        console.log(`Initialized ${result.value.key} in cloud successfully`);
      } else {
        console.error(`Failed to initialize ${result.value.key} in cloud: ${result.value.reason}`);
      }
    });
    
    return results.some(result => result.value.success);
  } catch (error) {
    console.error("Error initializing cloud data:", error);
    return false;
  }
};

// Helper to get bin ID for a section
const getBinIdForSection = (section) => {
  switch (section) {
    case "personalInfo":
    case "personal": // For backward compatibility
      return BIN_IDS.PERSONAL_INFO;
    case "education":
      return BIN_IDS.EDUCATION;
    case "experience":
      return BIN_IDS.EXPERIENCE;
    case "skills":
      return BIN_IDS.SKILLS;
    case "projects":
      return BIN_IDS.PROJECTS;
    case "highlights":
      return BIN_IDS.HIGHLIGHTS;
    case "pictures":
      return BIN_IDS.PICTURES;
    case "references":
      return BIN_IDS.REFERENCES;
    case "settings":
      return BIN_IDS.SETTINGS;
    default:
      return null;
  }
};

// Clear cache
const clearCache = () => {
  Object.keys(dataCache).forEach(key => {
    delete dataCache[key];
  });
};

// Check if sync is enabled
const isSyncEnabled = () => {
  return syncEnabled;
};

export default {
  initCloudSync,
  fetchFromCloud,
  saveToCloud,
  getAllFromCloud,
  initializeCloudData,
  toggleSyncEnabled,
  isSyncEnabled,
  clearCache
}; 