import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import styles from "./adminDashboard.module.css";
import portfolioService from "../../services/portfolioService";

// Import sample profile image - adjust the path to your actual image
import profileImage from "../../assets/profile.jpg";

const AdminDashboard = () => {
  // Get username from URL params
  const { username } = useParams();

  // Initialize portfolio data on component mount
  useEffect(() => {
    portfolioService.initializeStorage();
  }, []);

  // Load portfolio data on component mount
  useEffect(() => {
    const data = portfolioService.getAllData();

    // Set document title with username
    document.title = `${
      data.personalInfo.name || "Fahim Faysal"
    } - Portfolio Dashboard`;

    // Update portfolio stats for dashboard
    setPortfolioData({
      name: data.personalInfo.name || "Fahim Faysal",
      title: data.personalInfo.jobTitle || "Web Developer",
      projectsCount: data.projects.length,
      educationCount: data.education.length,
      skillsCount:
        data.skills.technical.length +
        data.skills.soft.length +
        data.skills.languages.length,
      portfolioViews: portfolioService.getPortfolioViews?.() || 0, // Optional chaining to safely handle missing method
    });

    // Set personal info data
    setPersonalInfo(data.personalInfo);

    // Set education data
    setEducationEntries(data.education);

    // Load experience data
    setExperienceEntries(data.experience);

    // Load skills data
    setSkillsData(data.skills);

    // Load highlight data
    setHighlightEntries(data.highlights);

    // Load project data
    setProjectEntries(data.projects);

    // Load pictures data
    setPictureEntries(data.pictures);

    // Load references data
    setReferenceEntries(data.references);

    // Load recent activity data
    const storedActivity = localStorage.getItem("portfolio_recent_activity");
    if (storedActivity) {
      setRecentActivity(JSON.parse(storedActivity));
    } else {
      // Try to get from sessionStorage if not in localStorage
      const sessionActivity = sessionStorage.getItem(
        "portfolio_recent_activity"
      );
      if (sessionActivity) {
        const parsedActivity = JSON.parse(sessionActivity);
        setRecentActivity(parsedActivity);
        // Restore to localStorage
        localStorage.setItem("portfolio_recent_activity", sessionActivity);
      } else {
        // Initialize with some default activity if none exists
        const defaultActivity = [
          {
            type: "edit",
            section: "Personal Information",
            timestamp: new Date().toISOString(),
          },
          {
            type: "add",
            section: "Projects",
            name: "Personal Portfolio",
            timestamp: new Date(
              new Date().setDate(new Date().getDate() - 1)
            ).toISOString(),
          },
          {
            type: "edit",
            section: "Skills",
            timestamp: new Date(
              new Date().setDate(new Date().getDate() - 1)
            ).toISOString(),
          },
        ];
        setRecentActivity(defaultActivity);
        localStorage.setItem(
          "portfolio_recent_activity",
          JSON.stringify(defaultActivity)
        );
        sessionStorage.setItem(
          "portfolio_recent_activity",
          JSON.stringify(defaultActivity)
        );
      }
    }
  }, []);

  // State for sidebar collapse
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // State for active section
  const [activeSection, setActiveSection] = useState("dashboard");

  // State for user dropdown
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // State for notification message
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  // State for recent activity
  const [recentActivity, setRecentActivity] = useState([]);

  // State for search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // State for portfolio data
  const [portfolioData, setPortfolioData] = useState({
    name: "Fahim Faysal",
    title: "Web Developer",
    projectsCount: 0,
    educationCount: 0,
    skillsCount: 0,
    portfolioViews: 0,
  });

  // State for personal info data
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    jobTitle: "",
    introText: "",
    bio: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    socialLinks: {
      linkedin: "",
      github: "",
      twitter: "",
      instagram: "",
    },
    hero: {
      greeting: "Hello, I'm",
      description: "",
      stats: [
        { value: "5+", label: "Years Experience" },
        { value: "100+", label: "Projects Completed" },
        { value: "50+", label: "Happy Clients" },
      ],
      buttonText: "Get In Touch",
      profileImageUrl: null,
    },
    aboutImageUrl: null,
  });

  // State for education data
  const [educationEntries, setEducationEntries] = useState([]);

  // State for education deletion confirmation
  const [deleteEducationIndex, setDeleteEducationIndex] = useState(null);
  const [showDeleteEducationConfirm, setShowDeleteEducationConfirm] =
    useState(false);

  // State for experience data
  const [experienceEntries, setExperienceEntries] = useState([]);

  // State for skills data
  const [skillsData, setSkillsData] = useState({
    technical: [],
    soft: [],
    languages: [],
  });

  // State for highlight data
  const [highlightEntries, setHighlightEntries] = useState([]);

  // State for project data
  const [projectEntries, setProjectEntries] = useState([]);

  // State for picture data
  const [pictureEntries, setPictureEntries] = useState([]);

  // State for reference data
  const [referenceEntries, setReferenceEntries] = useState([]);

  // State for settings data
  const [settingsData, setSettingsData] = useState({
    auth: {
      username: "",
      email: "",
      passwordHash: "",
    },
    portfolioTitle: "",
    faviconUrl: "",
    accentColor: "",
    secondaryColor: "",
    metaDescription: "",
  });

  // State for password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // State for password change error
  const [passwordError, setPasswordError] = useState("");

  // State for cloud sync
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);

  // Load settings data when section changes
  useEffect(() => {
    if (activeSection === "settings") {
      const settingsData = portfolioService.getSectionData("settings");
      setSettingsData(
        settingsData || {
          auth: {
            username: "",
            email: "",
            passwordHash: "",
          },
          portfolioTitle: "",
          faviconUrl: "",
          accentColor: "",
          secondaryColor: "",
          metaDescription: "",
        }
      );
      
      // Check if cloud sync is enabled
      portfolioService.isCloudSyncEnabled().then(enabled => {
        setCloudSyncEnabled(enabled);
      });
    }
  }, [activeSection]);

  // Function to show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Function to change active section
  const changeSection = (section) => {
    setActiveSection(section);

    // Load section-specific data
    if (section === "personal") {
      const personalData = portfolioService.getSectionData("personal");
      if (personalData) {
        setPersonalInfo(personalData);
      }
    } else if (section === "education") {
      const educationData = portfolioService.getSectionData("education");
      if (educationData) {
        setEducationEntries(educationData);
      }
    } else if (section === "experience") {
      const experienceData = portfolioService.getSectionData("experience");
      if (experienceData) {
        setExperienceEntries(experienceData);
      }
    } else if (section === "skills") {
      const skillsData = portfolioService.getSectionData("skills");
      if (skillsData) {
        setSkillsData(skillsData);
      }
    } else if (section === "highlights") {
      const highlightsData = portfolioService.getSectionData("highlights");
      if (highlightsData) {
        setHighlightEntries(highlightsData);
      }
    } else if (section === "projects") {
      const projectsData = portfolioService.getSectionData("projects");
      if (projectsData) {
        setProjectEntries(projectsData);
      }
    } else if (section === "pictures") {
      const picturesData = portfolioService.getSectionData("pictures");
      if (picturesData) {
        setPictureEntries(picturesData);
      }
    } else if (section === "references") {
      const referencesData = portfolioService.getSectionData("references");
      if (referencesData) {
        setReferenceEntries(referencesData);
      }
    }
  };

  // Function to toggle user dropdown
  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownOpen &&
        !event.target.closest(`.${styles["user-profile"]}`)
      ) {
        setUserDropdownOpen(false);
      }

      // Close search results if clicking outside
      if (
        showSearchResults &&
        !event.target.closest(`.${styles["search-container"]}`)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownOpen, showSearchResults]);

  // Handle logout
  const handleLogout = () => {
    // In a real app, you would handle proper logout
    window.location.href = "/admin/login";
  };

  // Personal Info Section Functions
  const updatePersonalInfo = (field, value) => {
    // For URL fields, ensure they start with https:// if not empty
    if (
      field.startsWith("socialLinks.") &&
      value &&
      !value.startsWith("https://")
    ) {
      value = "https://" + value;
    }

    setPersonalInfo((prevInfo) => {
      if (field.includes(".")) {
        // Handle nested fields like socialLinks.linkedin or hero.greeting
        const parts = field.split(".");
        if (parts.length === 2) {
          const [parent, child] = parts;
          return {
            ...prevInfo,
            [parent]: {
              ...(prevInfo[parent] || {}),
              [child]: value,
            },
          };
        }
      }
      return { ...prevInfo, [field]: value };
    });
  };

  const savePersonalInfoChanges = () => {
    // Save to service with the correct section name
    portfolioService.saveSectionData("personalInfo", personalInfo);

    // Log activity
    logActivity("edit", "Personal Information");

    showNotification(
      "Personal information and hero section saved successfully!"
    );
    setPortfolioData((prev) => ({
      ...prev,
      name: personalInfo.name,
      title: personalInfo.jobTitle,
    }));
  };

  // Education Section Functions
  const addEducationEntry = () => {
    const newEducation = {
      degree: "New Degree",
      field: "Field of Study",
      institution: "Institution Name",
      location: "Location",
      startDate: "",
      endDate: "",
      current: false,
      description: "Enter your description here",
    };

    const updatedEntries = [...educationEntries, newEducation];
    setEducationEntries(updatedEntries);

    // Log activity
    logActivity("add", "Education", "New Degree");

    // Scroll to the newly added education entry
    setTimeout(() => {
      const entries = document.querySelectorAll(
        `.${styles["education-entry"]}`
      );
      if (entries.length > 0) {
        entries[entries.length - 1].scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const updateEducationEntry = (index, field, value) => {
    const updatedEntries = [...educationEntries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setEducationEntries(updatedEntries);
  };

  const confirmDeleteEducation = (index) => {
    setDeleteEducationIndex(index);
    setShowDeleteEducationConfirm(true);
  };

  const deleteEducationEntry = () => {
    if (deleteEducationIndex !== null) {
      const deletedEntry = educationEntries[deleteEducationIndex];
      const updatedEntries = educationEntries.filter(
        (_, i) => i !== deleteEducationIndex
      );
      setEducationEntries(updatedEntries);
      setShowDeleteEducationConfirm(false);
      setDeleteEducationIndex(null);

      // Log activity
      logActivity(
        "delete",
        "Education",
        deletedEntry.degree || "Education Entry"
      );

      showNotification("Education entry deleted successfully!");
    }
  };

  const cancelDeleteEducation = () => {
    setShowDeleteEducationConfirm(false);
    setDeleteEducationIndex(null);
  };

  const saveEducationChanges = () => {
    portfolioService.saveSectionData("education", educationEntries);
    logActivity("edit", "Education");
    showNotification("Education saved successfully!");

    // Update portfolio stats
    setPortfolioData((prev) => ({
      ...prev,
      educationCount: educationEntries.length,
    }));
  };

  // Experience Section Functions
  const addExperienceEntry = () => {
    const newExperience = {
      position: "New Position",
      company: "Company Name",
      location: "Location",
      period: "Period",
      description: "Enter your description here",
    };

    const updatedEntries = [...experienceEntries, newExperience];
    setExperienceEntries(updatedEntries);

    // Log activity
    logActivity("add", "Experience", "New Position");
  };

  const updateExperienceEntry = (index, field, value) => {
    const updatedEntries = [...experienceEntries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setExperienceEntries(updatedEntries);
  };

  const deleteExperienceEntry = (index) => {
    const deletedEntry = experienceEntries[index];
    const updatedEntries = experienceEntries.filter((_, i) => i !== index);
    setExperienceEntries(updatedEntries);

    // Log activity
    logActivity(
      "delete",
      "Experience",
      deletedEntry.position || "Experience Entry"
    );
  };

  const saveExperienceChanges = () => {
    portfolioService.saveSectionData("experience", experienceEntries);
    logActivity("edit", "Experience");
    showNotification("Experience saved successfully!");

    // Update portfolio stats
    setPortfolioData((prev) => ({
      ...prev,
      experienceCount: experienceEntries.length,
    }));
  };

  // Highlights Section Functions
  const addHighlightEntry = () => {
    const newHighlight = {
      title: "New Achievement",
      date: new Date().toISOString().slice(0, 7), // Current month in YYYY-MM format
      category: "achievement",
      description: "Enter description here",
    };

    const updatedEntries = [...highlightEntries, newHighlight];
    setHighlightEntries(updatedEntries);

    // Log activity
    logActivity("add", "Highlights", "New Achievement");
  };

  const updateHighlightEntry = (index, field, value) => {
    const updatedEntries = [...highlightEntries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setHighlightEntries(updatedEntries);
  };

  const deleteHighlightEntry = (index) => {
    const deletedEntry = highlightEntries[index];
    const updatedEntries = highlightEntries.filter((_, i) => i !== index);
    setHighlightEntries(updatedEntries);

    // Log activity
    logActivity(
      "delete",
      "Highlights",
      deletedEntry.title || "Highlight Entry"
    );
  };

  const saveHighlightChanges = () => {
    portfolioService.saveSectionData("highlights", highlightEntries);
    logActivity("edit", "Highlights");
    showNotification("Highlights saved successfully!");
  };

  // Projects Section Functions
  const addProjectEntry = () => {
    const newProject = {
      title: "New Project",
      category: "Web Development",
      description: "Enter project description here",
      image: null,
      demoUrl: "#",
      repoUrl: "#",
      date: new Date().toISOString().slice(0, 7), // Current month in YYYY-MM format
      technologies: "HTML, CSS, JavaScript",
    };

    const updatedEntries = [...projectEntries, newProject];
    setProjectEntries(updatedEntries);

    // Log activity
    logActivity("add", "Projects", "New Project");
  };

  const updateProjectEntry = (index, field, value) => {
    const updatedEntries = [...projectEntries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setProjectEntries(updatedEntries);
  };

  const deleteProjectEntry = (index) => {
    const deletedProject = projectEntries[index];
    const updatedEntries = projectEntries.filter((_, i) => i !== index);
    setProjectEntries(updatedEntries);

    // Log activity
    logActivity("delete", "Projects", deletedProject.title || "Project Entry");
  };

  const saveProjectChanges = () => {
    portfolioService.saveSectionData("projects", projectEntries);
    logActivity("edit", "Projects");
    showNotification("Projects saved successfully!");

    // Update portfolio stats
    setPortfolioData((prev) => ({
      ...prev,
      projectsCount: projectEntries.length,
    }));
  };

  // Pictures Section Functions
  const addPictureEntry = () => {
    const newPicture = {
      title: "New Picture",
      category: "Landscape",
      image: null,
      description: "Enter picture description here",
      link: "#",
    };

    const updatedEntries = [...pictureEntries, newPicture];
    setPictureEntries(updatedEntries);

    // Log activity
    logActivity("add", "Pictures", "New Picture");
  };

  const updatePictureEntry = (index, field, value) => {
    const updatedEntries = [...pictureEntries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setPictureEntries(updatedEntries);
  };

  const deletePictureEntry = (index) => {
    const deletedPicture = pictureEntries[index];
    const updatedEntries = pictureEntries.filter((_, i) => i !== index);
    setPictureEntries(updatedEntries);

    // Log activity
    logActivity("delete", "Pictures", deletedPicture.title || "Picture Entry");
  };

  const savePictureChanges = () => {
    portfolioService.saveSectionData("pictures", pictureEntries);
    logActivity("edit", "Pictures");
    showNotification("Pictures saved successfully!");
  };

  // References Section Functions
  const addReferenceEntry = () => {
    const newReference = {
      name: "New Reference",
      position: "Position",
      company: "Company Name",
      image: null,
      quote: "Enter testimonial here",
    };

    const updatedEntries = [...referenceEntries, newReference];
    setReferenceEntries(updatedEntries);

    // Log activity
    logActivity("add", "References", "New Reference");
  };

  const updateReferenceEntry = (index, field, value) => {
    const updatedEntries = [...referenceEntries];
    updatedEntries[index] = { ...updatedEntries[index], [field]: value };
    setReferenceEntries(updatedEntries);
  };

  const deleteReferenceEntry = (index) => {
    const deletedReference = referenceEntries[index];
    const updatedEntries = referenceEntries.filter((_, i) => i !== index);
    setReferenceEntries(updatedEntries);

    // Log activity
    logActivity(
      "delete",
      "References",
      deletedReference.name || "Reference Entry"
    );
  };

  const saveReferenceChanges = () => {
    portfolioService.saveSectionData("references", referenceEntries);
    logActivity("edit", "References");
    showNotification("References saved successfully!");
  };

  // Skills Section Functions
  const saveSkillsChanges = () => {
    portfolioService.saveSectionData("skills", skillsData);
    logActivity("edit", "Skills");
    showNotification("Skills saved successfully!");

    // Update portfolio stats
    setPortfolioData((prev) => ({
      ...prev,
      skillsCount:
        skillsData.technical.length +
        skillsData.soft.length +
        skillsData.languages.length,
    }));
  };

  const addSkill = (type, name = "", level = "intermediate") => {
    setSkillsData((prev) => {
      const updated = { ...prev };

      if (type === "technical") {
        updated.technical = [...prev.technical, { name, level }];
        // Log activity
        logActivity("add", "Skills", name || "Technical Skill");
      } else if (type === "soft") {
        updated.soft = [...prev.soft, { name }];
        // Log activity
        logActivity("add", "Skills", name || "Soft Skill");
      } else if (type === "languages") {
        updated.languages = [...prev.languages, { name, level }];
        // Log activity
        logActivity("add", "Skills", name || "Language Skill");
      }

      return updated;
    });
  };

  const updateSkill = (type, index, field, value) => {
    setSkillsData((prev) => {
      const updated = { ...prev };

      if (type === "technical") {
        updated.technical = [...prev.technical];
        updated.technical[index] = {
          ...updated.technical[index],
          [field]: value,
        };
      } else if (type === "soft") {
        updated.soft = [...prev.soft];
        updated.soft[index] = {
          ...updated.soft[index],
          [field]: value,
        };
      } else if (type === "languages") {
        updated.languages = [...prev.languages];
        updated.languages[index] = {
          ...updated.languages[index],
          [field]: value,
        };
      }

      return updated;
    });
  };

  const deleteSkill = (type, index) => {
    setSkillsData((prev) => {
      const updated = { ...prev };
      let skillName = "";

      if (type === "technical") {
        skillName = prev.technical[index]?.name || "Technical Skill";
        updated.technical = prev.technical.filter((_, i) => i !== index);
      } else if (type === "soft") {
        skillName = prev.soft[index]?.name || "Soft Skill";
        updated.soft = prev.soft.filter((_, i) => i !== index);
      } else if (type === "languages") {
        skillName = prev.languages[index]?.name || "Language Skill";
        updated.languages = prev.languages.filter((_, i) => i !== index);
      }

      // Log activity
      logActivity("delete", "Skills", skillName);

      return updated;
    });
  };

  // Update settings data
  const updateSettings = (field, value) => {
    setSettingsData({
      ...settingsData,
      [field]: value,
    });
  };

  // Update auth settings
  const updateAuthSettings = (field, value) => {
    setSettingsData({
      ...settingsData,
      auth: {
        ...settingsData.auth,
        [field]: value,
      },
    });
  };

  // Update password form
  const updatePasswordForm = (field, value) => {
    setPasswordForm({
      ...passwordForm,
      [field]: value,
    });
  };

  // Handle password change
  const handlePasswordChange = () => {
    setPasswordError("");

    // Get settings with auth info
    const settings = portfolioService.getSectionData("settings");
    const { passwordHash } = settings?.auth || {};

    // Verify current password
    const currentPasswordCorrect = passwordHash
      ? atob(passwordHash) === passwordForm.currentPassword
      : passwordForm.currentPassword === "1234";

    if (!currentPasswordCorrect) {
      setPasswordError("Current password is incorrect");
      return;
    }

    // Validate new password
    if (passwordForm.newPassword.length < 4) {
      setPasswordError("New password must be at least 4 characters");
      return;
    }

    // Validate password confirmation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    // Update password
    const updatedSettings = {
      ...settingsData,
      auth: {
        ...settingsData.auth,
        passwordHash: btoa(passwordForm.newPassword),
      },
    };

    // Save settings
    portfolioService.saveSectionData("settings", updatedSettings);
    setSettingsData(updatedSettings);

    // Clear password form
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    // Show success notification
    showNotification("Password updated successfully");
  };

  // Save settings changes
  const saveSettingsChanges = () => {
    portfolioService.saveSectionData("settings", settingsData);
    showNotification("Settings saved successfully");
  };

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "portfolio_personal_info" || e.key === "lastUpdate") {
        const personalData = portfolioService.getSectionData("personalInfo");
        if (personalData) {
          setPersonalInfo(personalData);
        }
      }
    };

    // Also listen for custom local data changed events
    const handleLocalDataChanged = (e) => {
      if (e.detail?.key === "portfolio_personal_info") {
        const personalData = portfolioService.getSectionData("personalInfo");
        if (personalData) {
          setPersonalInfo(personalData);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("localDataChanged", handleLocalDataChanged);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localDataChanged", handleLocalDataChanged);
    };
  }, []);

  // Function to log activity
  const logActivity = (type, section, name = null) => {
    const newActivity = {
      type,
      section,
      name,
      timestamp: new Date().toISOString(),
    };
    const updatedActivity = [newActivity, ...recentActivity.slice(0, 9)]; // Keep only the 10 most recent activities
    setRecentActivity(updatedActivity);
    localStorage.setItem(
      "portfolio_recent_activity",
      JSON.stringify(updatedActivity)
    );
    sessionStorage.setItem(
      "portfolio_recent_activity",
      JSON.stringify(updatedActivity)
    );
  };

  // Format relative date
  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return (
        "Today, " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } else if (diffDays === 1) {
      return (
        "Yesterday, " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } else if (diffDays < 7) {
      return (
        `${diffDays} days ago, ` +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } else {
      return (
        date.toLocaleDateString() +
        ", " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }
  };

  // Handle search function
  const handleSearch = (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setShowSearchResults(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = [];

    // Search in projects
    projectEntries.forEach((project) => {
      if (
        project.title.toLowerCase().includes(lowerQuery) ||
        project.description.toLowerCase().includes(lowerQuery) ||
        project.category.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: "project",
          title: project.title,
          subtitle: project.category,
          section: "projects",
        });
      }
    });

    // Search in education
    educationEntries.forEach((education) => {
      if (
        education.degree.toLowerCase().includes(lowerQuery) ||
        education.institution.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: "education",
          title: education.degree,
          subtitle: education.institution,
          section: "education",
        });
      }
    });

    // Search in experience
    experienceEntries.forEach((experience) => {
      if (
        experience.position.toLowerCase().includes(lowerQuery) ||
        experience.company.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: "experience",
          title: experience.position,
          subtitle: experience.company,
          section: "experience",
        });
      }
    });

    // Search in skills
    skillsData.technical.forEach((skill) => {
      if (skill.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: "skill",
          title: skill.name,
          subtitle: "Technical Skill",
          section: "skills",
        });
      }
    });

    skillsData.soft.forEach((skill) => {
      if (skill.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: "skill",
          title: skill.name,
          subtitle: "Soft Skill",
          section: "skills",
        });
      }
    });

    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  };

  // Add the export function after other utility functions
  const exportPortfolioData = () => {
    try {
      const data = portfolioService.getAllData();
      
      // Create formatted JSON string with indentation for better readability
      const jsonData = JSON.stringify(data, null, 2);
      
      // Create a blob from the data
      const blob = new Blob([jsonData], { type: 'application/json' });
      
      // Create a temporary download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'portfolio_data.json';
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      // Show notification
      showNotification("Portfolio data exported successfully", "success");
    } catch (error) {
      console.error("Error exporting portfolio data:", error);
      showNotification("Error exporting portfolio data", "error");
    }
  };

  return (
    <div className={styles["admin-dashboard"]}>
      {/* Side Navigation */}
      <aside
        className={`${styles["side-nav"]} ${
          sidebarCollapsed ? styles["collapsed"] : ""
        }`}
      >
        <div className={styles["side-nav-header"]}>
          <div className={styles["profile-image"]}>
            {personalInfo.hero?.profileImageUrl ? (
              <img
                src={personalInfo.hero.profileImageUrl}
                alt="Admin"
                id="navProfileImage"
              />
            ) : (
              <img src={profileImage} alt="Admin" id="navProfileImage" />
            )}
          </div>
          <h3 id="navProfileName">{portfolioData.name}</h3>
          <p id="navProfileTitle">{portfolioData.title}</p>
        </div>

        <nav className={styles["side-nav-menu"]}>
          <button
            className={`${styles["nav-item"]} ${
              activeSection === "dashboard" ? styles["active"] : ""
            }`}
            onClick={() => changeSection("dashboard")}
          >
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </button>
          <button
            className={`${styles["nav-item"]} ${
              activeSection === "personal" ? styles["active"] : ""
            }`}
            onClick={() => changeSection("personal")}
          >
            <i className="fas fa-user"></i>
            <span>Personal Info</span>
          </button>
          <button
            className={`${styles["nav-item"]} ${
              activeSection === "education" ? styles["active"] : ""
            }`}
            onClick={() => changeSection("education")}
          >
            <i className="fas fa-graduation-cap"></i>
            <span>Education</span>
          </button>
          <button
            className={`${styles["nav-item"]} ${
              activeSection === "experience" ? styles["active"] : ""
            }`}
            onClick={() => changeSection("experience")}
          >
            <i className="fas fa-briefcase"></i>
            <span>Experience</span>
          </button>
          <button
            className={`${styles["nav-item"]} ${
              activeSection === "skills" ? styles["active"] : ""
            }`}
            onClick={() => changeSection("skills")}
          >
            <i className="fas fa-laptop-code"></i>
            <span>Skills</span>
          </button>
          <button
            className={`${styles["nav-item"]} ${
              activeSection === "highlights" ? styles["active"] : ""
            }`}
            onClick={() => changeSection("highlights")}
          >
            <i className="fas fa-star"></i>
            <span>Highlights</span>
          </button>
          <button
            className={`${styles["nav-item"]} ${
              activeSection === "projects" ? styles["active"] : ""
            }`}
            onClick={() => changeSection("projects")}
          >
            <i className="fas fa-code"></i>
            <span>Projects</span>
          </button>
          <button
            className={`${styles["nav-item"]} ${
              activeSection === "pictures" ? styles["active"] : ""
            }`}
            onClick={() => changeSection("pictures")}
          >
            <i className="fas fa-images"></i>
            <span>Pictures</span>
          </button>
          <button
            className={`${styles["nav-item"]} ${
              activeSection === "references" ? styles["active"] : ""
            }`}
            onClick={() => changeSection("references")}
          >
            <i className="fas fa-user-friends"></i>
            <span>References</span>
          </button>
          <button
            className={`${styles["nav-item"]} ${
              activeSection === "settings" ? styles["active"] : ""
            }`}
            onClick={() => changeSection("settings")}
          >
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </button>
        </nav>

        <div className={styles["side-nav-footer"]}>
          <Link to="/" className={styles["view-site-btn"]} target="_blank">
            <i className="fas fa-eye"></i> View Portfolio
          </Link>
          <button onClick={handleLogout} className={styles["logout-btn"]}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        className={`${styles["main-content"]} ${
          sidebarCollapsed ? styles["expanded"] : ""
        }`}
      >
        {/* Header section with user profile */}
        <header className={styles["dashboard-header"]}>
          <div className={styles["toggle-sidebar"]} onClick={toggleSidebar}>
            <i className="fas fa-bars"></i>
          </div>
          <div className={styles["header-title"]}>
            <h2>{portfolioData.name}'s Portfolio Dashboard</h2>
          </div>
          <div className={styles["search-container"]}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) {
                  setShowSearchResults(true);
                }
              }}
            />
            {showSearchResults && (
              <div className={styles["search-results"]}>
                {searchResults.length > 0 ? (
                  searchResults.map((result, index) => (
                    <div
                      key={index}
                      className={styles["search-result-item"]}
                      onClick={() => {
                        changeSection(result.section);
                        setShowSearchResults(false);
                        setSearchQuery("");
                      }}
                    >
                      <div className={styles["result-icon"]}>
                        {result.type === "project" && (
                          <i className="fas fa-code"></i>
                        )}
                        {result.type === "education" && (
                          <i className="fas fa-graduation-cap"></i>
                        )}
                        {result.type === "experience" && (
                          <i className="fas fa-briefcase"></i>
                        )}
                        {result.type === "skill" && (
                          <i className="fas fa-laptop-code"></i>
                        )}
                      </div>
                      <div className={styles["result-details"]}>
                        <div className={styles["result-title"]}>
                          {result.title}
                        </div>
                        <div className={styles["result-subtitle"]}>
                          {result.subtitle}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles["no-results"]}>No results found</div>
                )}
              </div>
            )}
          </div>
          <div className={styles["header-actions"]}>
            <div
              className={styles["user-profile"]}
              onClick={toggleUserDropdown}
            >
              <span className={styles["user-name"]}>{portfolioData.name}</span>
              <i
                className={`fas fa-chevron-down ${styles["dropdown-icon"]}`}
              ></i>
              <div
                className={`${styles["user-dropdown"]} ${
                  userDropdownOpen ? styles["show"] : ""
                }`}
              >
                <div className={styles["dropdown-header"]}>
                  <div className={styles["dropdown-user-info"]}>
                    <h4>{portfolioData.name}</h4>
                    <p>{portfolioData.title}</p>
                  </div>
                </div>
                <button
                  className={styles["dropdown-item"]}
                  onClick={() => changeSection("personal")}
                >
                  <i className="fas fa-user-circle"></i> Profile
                </button>
                <button
                  className={styles["dropdown-item"]}
                  onClick={() => changeSection("settings")}
                >
                  <i className="fas fa-cog"></i> Settings
                </button>
                <button
                  className={styles["dropdown-item"]}
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Notification Banner */}
        {notification.show && (
          <div
            className={`${styles["notification"]} ${styles[notification.type]}`}
          >
            {notification.message}
          </div>
        )}

        {/* Data Recovery Notice */}
        <div
          className={styles["data-recovery-notice"]}
          style={{
            background: "rgba(0, 188, 212, 0.1)",
            border: "1px solid rgba(0, 188, 212, 0.3)",
            borderRadius: "4px",
            padding: "12px 16px",
            margin: "10px 15px",
            display: "flex",
            alignItems: "center",
            color: "#00bcd4",
            fontSize: "14px",
          }}
        >
          <span style={{ marginRight: "10px", fontSize: "20px" }}>🛟</span>
          <div>
            <strong>New Data Recovery Feature:</strong> If you notice any data
            loss, click the life preserver button in the bottom-right corner to
            restore your data.
          </div>
          <button
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "none",
              color: "#888",
              cursor: "pointer",
              fontSize: "16px",
            }}
            onClick={(e) => {
              e.target.parentElement.style.display = "none";
            }}
          >
            ✖
          </button>
        </div>

        {/* Dashboard Content Area */}
        <div className={styles["dashboard-content"]}>
          {/* Dashboard Home View */}
          <div
            id="dashboardHome"
            className={`${styles["content-section"]} ${
              activeSection === "dashboard" ? styles["active"] : ""
            }`}
          >
            <div className={styles["welcome-stats"]}>
              <div className={styles["welcome-message"]}>
                <h1>
                  Welcome back,{" "}
                  <span id="welcomeName">
                    {portfolioData.name.split(" ")[0]}
                  </span>
                  !
                </h1>
                <p>Here's a summary of your portfolio stats</p>
              </div>
              <div className={styles["stats-cards"]}>
                <div className={styles["stat-card"]}>
                  <div className={styles["stat-icon"]}>
                    <i className="fas fa-briefcase"></i>
                  </div>
                  <div className={styles["stat-info"]}>
                    <h3>{portfolioData.projectsCount}</h3>
                    <p>Projects</p>
                  </div>
                </div>
                <div className={styles["stat-card"]}>
                  <div className={styles["stat-icon"]}>
                    <i className="fas fa-graduation-cap"></i>
                  </div>
                  <div className={styles["stat-info"]}>
                    <h3>{portfolioData.educationCount}</h3>
                    <p>Education</p>
                  </div>
                </div>
                <div className={styles["stat-card"]}>
                  <div className={styles["stat-icon"]}>
                    <i className="fas fa-laptop-code"></i>
                  </div>
                  <div className={styles["stat-info"]}>
                    <h3>{portfolioData.skillsCount}</h3>
                    <p>Skills</p>
                  </div>
                </div>
                <div className={styles["stat-card"]}>
                  <div className={styles["stat-icon"]}>
                    <i className="fas fa-eye"></i>
                  </div>
                  <div className={styles["stat-info"]}>
                    <h3>{portfolioData.portfolioViews}</h3>
                    <p>Portfolio Views</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles["quick-actions"]}>
              <h2>Quick Actions</h2>
              <div className={styles["action-buttons"]}>
                <button
                  className={styles["action-btn"]}
                  onClick={() => changeSection("projects")}
                >
                  <i className="fas fa-plus"></i> Add Project
                </button>
                <button
                  className={styles["action-btn"]}
                  onClick={() => changeSection("skills")}
                >
                  <i className="fas fa-plus"></i> Add Skill
                </button>
                <button
                  className={styles["action-btn"]}
                  onClick={() => changeSection("education")}
                >
                  <i className="fas fa-plus"></i> Add Education
                </button>
                <button
                  className={styles["action-btn"]}
                  onClick={() => changeSection("pictures")}
                >
                  <i className="fas fa-plus"></i> Upload Image
                </button>
              </div>
            </div>

            <div className={styles["recent-activity"]}>
              <h2>Recent Activity</h2>
              <div className={styles["activity-timeline"]}>
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 3).map((activity, index) => (
                    <div className={styles["activity-item"]} key={index}>
                      <div className={styles["activity-icon"]}>
                        {activity.type === "edit" && (
                          <i className="fas fa-edit"></i>
                        )}
                        {activity.type === "add" && (
                          <i className="fas fa-plus"></i>
                        )}
                        {activity.type === "delete" && (
                          <i className="fas fa-trash"></i>
                        )}
                      </div>
                      <div className={styles["activity-details"]}>
                        <p>
                          You{" "}
                          {activity.type === "edit"
                            ? "updated"
                            : activity.type === "add"
                            ? "added"
                            : "deleted"}
                          {activity.type === "add" && activity.name
                            ? ` a new ${activity.section.slice(0, -1)}: `
                            : " your "}
                          <strong>
                            {activity.type === "add" && activity.name
                              ? activity.name
                              : activity.section}
                          </strong>
                        </p>
                        <span className={styles["activity-time"]}>
                          {formatRelativeDate(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles["no-activity"]}>
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personal Info Section */}
          <div
            id="personalEditor"
            className={`${styles["content-section"]} ${
              activeSection === "personal" ? styles["active"] : ""
            }`}
          >
            <div className={styles["content-editor"]}>
              <div className={styles["editor-header"]}>
                <h2>Edit Personal Information</h2>
                <div className={styles["editor-actions"]}>
                  <button
                    className={`${styles["action-btn"]} ${styles["save"]}`}
                    onClick={savePersonalInfoChanges}
                  >
                    Save Changes
                  </button>
                  <button
                    className={`${styles["action-btn"]} ${styles["cancel"]}`}
                    onClick={() => changeSection("dashboard")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div className={styles["editor-content"]}>
                <div className={styles["form-section"]}>
                  <h3 className={styles["form-section-title"]}>
                    Profile & Image
                  </h3>

                  <div className={styles["form-group"]}>
                    <label htmlFor="heroProfileImage">Profile Image</label>
                    <div className={styles["image-upload-container"]}>
                      <div className={styles["current-image"]}>
                        {personalInfo.hero?.profileImageUrl ? (
                          <img
                            src={personalInfo.hero?.profileImageUrl}
                            alt="Current profile"
                            className={styles["preview-image"]}
                          />
                        ) : (
                          <img
                            src={profileImage}
                            alt="Default profile"
                            className={styles["preview-image"]}
                          />
                        )}
                      </div>
                      <div className={styles["upload-controls"]}>
                        <input
                          type="file"
                          id="heroProfileImage"
                          className={styles["file-input"]}
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const reader = new FileReader();

                              // Display loading notification
                              showNotification(
                                "Uploading and processing image...",
                                "info"
                              );

                              reader.onload = (event) => {
                                if (typeof event.target?.result === "string") {
                                  try {
                                    // Use the debug and fix functions from portfolioService
                                    console.group("Image Upload Process");
                                    console.log(
                                      "Image loaded from file selection"
                                    );

                                    // Log current data state before changes
                                    portfolioService.debugPortfolioData();

                                    // Use the direct fix function
                                    const imageUrl = event.target.result;
                                    const success =
                                      portfolioService.fixHeroImageData(
                                        imageUrl
                                      );

                                    if (success) {
                                      // Refresh personal info data
                                      const updatedData =
                                        portfolioService.getSectionData(
                                          "personalInfo"
                                        );
                                      if (updatedData) {
                                        setPersonalInfo(updatedData);
                                        console.log(
                                          "Updated personal info state:",
                                          updatedData
                                        );
                                      }

                                      // Show success notification
                                      showNotification(
                                        "Profile image updated successfully!",
                                        "success"
                                      );

                                      // Force refresh in the window to show updates
                                      setTimeout(() => {
                                        // Check if the image was properly saved
                                        portfolioService.debugPortfolioData();
                                      }, 500);
                                    } else {
                                      showNotification(
                                        "Failed to update profile image.",
                                        "error"
                                      );
                                    }

                                    console.groupEnd();
                                  } catch (error) {
                                    console.error(
                                      "Error in image upload process:",
                                      error
                                    );
                                    showNotification(
                                      "Error processing image: " +
                                        error.message,
                                      "error"
                                    );
                                  }
                                }
                              };

                              reader.onerror = () => {
                                showNotification(
                                  "Failed to read the image file.",
                                  "error"
                                );
                              };

                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <label
                          htmlFor="heroProfileImage"
                          className={styles["upload-btn"]}
                        >
                          <i className="fas fa-upload"></i> Upload Image
                        </label>
                        {personalInfo.hero?.profileImageUrl && (
                          <button
                            className={`${styles["action-btn"]} ${styles["delete"]}`}
                            onClick={() => {
                              try {
                                // Use the direct fix function with null to remove the image
                                const success =
                                  portfolioService.fixHeroImageData(null);

                                if (success) {
                                  // Refresh personal info data
                                  const updatedData =
                                    portfolioService.getSectionData(
                                      "personalInfo"
                                    );
                                  if (updatedData) {
                                    setPersonalInfo(updatedData);
                                  }

                                  // Show success notification
                                  showNotification(
                                    "Profile image removed successfully!",
                                    "success"
                                  );
                                } else {
                                  showNotification(
                                    "Failed to remove profile image.",
                                    "error"
                                  );
                                }
                              } catch (error) {
                                console.error("Error removing image:", error);
                                showNotification(
                                  "Error removing image: " + error.message,
                                  "error"
                                );
                              }
                            }}
                          >
                            <i className="fas fa-trash-alt"></i> Remove
                          </button>
                        )}
                      </div>
                      <div className={styles["form-note"]}>
                        This profile picture appears in your Hero section,
                        Header, and About page
                      </div>
                    </div>
                  </div>

                  <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                      <label htmlFor="personalName">Full Name</label>
                      <input
                        type="text"
                        id="personalName"
                        className={styles["form-control"]}
                        placeholder="Your full name"
                        value={personalInfo.name}
                        onChange={(e) =>
                          updatePersonalInfo("name", e.target.value)
                        }
                      />
                      <small className={styles["form-helper-text"]}>
                        Used in your Hero section, Header and throughout the
                        site
                      </small>
                    </div>
                    <div className={styles["form-group"]}>
                      <label htmlFor="personalJobTitle">Job Title</label>
                      <input
                        type="text"
                        id="personalJobTitle"
                        className={styles["form-control"]}
                        placeholder="e.g. Full Stack Developer"
                        value={personalInfo.jobTitle}
                        onChange={(e) =>
                          updatePersonalInfo("jobTitle", e.target.value)
                        }
                      />
                      <small className={styles["form-helper-text"]}>
                        Appears below your name in the Hero section and Header
                      </small>
                    </div>
                  </div>
                </div>

                <div className={styles["form-section"]}>
                  <h3 className={styles["form-section-title"]}>
                    Hero & Header Content
                  </h3>

                  <div className={styles["form-group"]}>
                    <label htmlFor="heroGreeting">Greeting Text</label>
                    <input
                      type="text"
                      id="heroGreeting"
                      className={styles["form-control"]}
                      placeholder="e.g. Hello, I'm"
                      value={personalInfo.hero?.greeting || "Hello, I'm"}
                      onChange={(e) =>
                        updatePersonalInfo("hero.greeting", e.target.value)
                      }
                    />
                    <small className={styles["form-helper-text"]}>
                      Appears above your name in the Hero section
                    </small>
                  </div>

                  <div className={styles["form-group"]}>
                    <label htmlFor="heroDescription">Hero Description</label>
                    <textarea
                      id="heroDescription"
                      className={`${styles["form-control"]}`}
                      rows="3"
                      placeholder="Brief description for your hero section"
                      value={personalInfo.hero?.description || ""}
                      onChange={(e) =>
                        updatePersonalInfo("hero.description", e.target.value)
                      }
                    ></textarea>
                    <small className={styles["form-helper-text"]}>
                      Will fall back to your introduction if left empty
                    </small>
                  </div>

                  <div className={styles["form-group"]}>
                    <label htmlFor="heroButtonText">Button Text</label>
                    <input
                      type="text"
                      id="heroButtonText"
                      className={styles["form-control"]}
                      placeholder="e.g. Get In Touch"
                      value={personalInfo.hero?.buttonText || "Get In Touch"}
                      onChange={(e) =>
                        updatePersonalInfo("hero.buttonText", e.target.value)
                      }
                    />
                    <small className={styles["form-helper-text"]}>
                      Text on the call-to-action button in your Hero section
                    </small>
                  </div>

                  <h4 className={styles["form-subsection-title"]}>
                    Hero Stats
                  </h4>
                  <p className={styles["form-helper-text"]}>
                    These statistics are displayed in your hero section
                  </p>

                  {(personalInfo.hero?.stats || []).map((stat, index) => (
                    <div key={index} className={styles["form-row"]}>
                      <div className={styles["form-group"]}>
                        <label htmlFor={`heroStatValue${index}`}>Value</label>
                        <input
                          type="text"
                          id={`heroStatValue${index}`}
                          className={styles["form-control"]}
                          placeholder="e.g. 5+"
                          value={stat.value || ""}
                          onChange={(e) => {
                            const updatedStats = [
                              ...(personalInfo.hero?.stats || []),
                            ];
                            updatedStats[index] = {
                              ...updatedStats[index],
                              value: e.target.value,
                            };
                            updatePersonalInfo("hero.stats", updatedStats);
                          }}
                        />
                      </div>
                      <div className={styles["form-group"]}>
                        <label htmlFor={`heroStatLabel${index}`}>Label</label>
                        <input
                          type="text"
                          id={`heroStatLabel${index}`}
                          className={styles["form-control"]}
                          placeholder="e.g. Years Experience"
                          value={stat.label || ""}
                          onChange={(e) => {
                            const updatedStats = [
                              ...(personalInfo.hero?.stats || []),
                            ];
                            updatedStats[index] = {
                              ...updatedStats[index],
                              label: e.target.value,
                            };
                            updatePersonalInfo("hero.stats", updatedStats);
                          }}
                        />
                      </div>
                      <div className={styles["form-action"]}>
                        <button
                          className={`${styles["action-btn"]} ${styles["delete"]}`}
                          onClick={() => {
                            const updatedStats = (
                              personalInfo.hero?.stats || []
                            ).filter((_, i) => i !== index);
                            updatePersonalInfo("hero.stats", updatedStats);
                          }}
                          disabled={
                            (personalInfo.hero?.stats || []).length <= 1
                          }
                          title="Delete stat"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className={styles["form-actions"]}>
                    <button
                      className={`${styles["action-btn"]} ${styles["add"]}`}
                      onClick={() => {
                        const updatedStats = [
                          ...(personalInfo.hero?.stats || []),
                          { value: "", label: "" },
                        ];
                        updatePersonalInfo("hero.stats", updatedStats);
                      }}
                    >
                      <i className="fas fa-plus"></i> Add Stat
                    </button>
                  </div>
                </div>

                <div className={styles["form-section"]}>
                  <h3 className={styles["form-section-title"]}>
                    About Section
                  </h3>

                  <div className={styles["form-group"]}>
                    <label htmlFor="aboutImage">About Section Image</label>
                    <div className={styles["image-upload-container"]}>
                      <div className={styles["current-image"]}>
                        {personalInfo.aboutImageUrl ? (
                          <img
                            src={personalInfo.aboutImageUrl}
                            alt="About section"
                            className={styles["preview-image"]}
                          />
                        ) : (
                          <div className={styles["no-image"]}>
                            <i className="fas fa-image"></i>
                            <span>No image</span>
                          </div>
                        )}
                      </div>
                      <div className={styles["upload-controls"]}>
                        <input
                          type="file"
                          id="aboutImage"
                          className={styles["file-input"]}
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (typeof event.target?.result === "string") {
                                  updatePersonalInfo(
                                    "aboutImageUrl",
                                    event.target.result
                                  );
                                  showNotification(
                                    "About image updated successfully!"
                                  );
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <label
                          htmlFor="aboutImage"
                          className={styles["upload-btn"]}
                        >
                          <i className="fas fa-upload"></i> Upload Image
                        </label>
                        {personalInfo.aboutImageUrl && (
                          <button
                            className={`${styles["action-btn"]} ${styles["delete"]}`}
                            onClick={() =>
                              updatePersonalInfo("aboutImageUrl", null)
                            }
                          >
                            <i className="fas fa-trash-alt"></i> Remove
                          </button>
                        )}
                      </div>
                      <div className={styles["form-note"]}>
                        This image appears in your About section
                      </div>
                    </div>
                  </div>

                  <div className={styles["form-group"]}>
                    <label htmlFor="personalBio">Biography</label>
                    <textarea
                      id="personalBio"
                      className={styles["form-control"]}
                      rows="5"
                      placeholder="Detailed biography for your About section"
                      value={personalInfo.bio}
                      onChange={(e) =>
                        updatePersonalInfo("bio", e.target.value)
                      }
                    ></textarea>
                    <small className={styles["form-helper-text"]}>
                      Displayed in your About section
                    </small>
                  </div>
                </div>

                <div className={styles["form-section"]}>
                  <h3 className={styles["form-section-title"]}>
                    Contact Information
                  </h3>
                  <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                      <label htmlFor="personalEmail">Email Address</label>
                      <input
                        type="email"
                        id="personalEmail"
                        className={styles["form-control"]}
                        placeholder="your.email@example.com"
                        value={personalInfo.email}
                        onChange={(e) =>
                          updatePersonalInfo("email", e.target.value)
                        }
                      />
                    </div>
                    <div className={styles["form-group"]}>
                      <label htmlFor="personalPhone">Phone Number</label>
                      <input
                        type="tel"
                        id="personalPhone"
                        className={styles["form-control"]}
                        placeholder="+1 234 567 890"
                        value={personalInfo.phone}
                        onChange={(e) =>
                          updatePersonalInfo("phone", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                      <label htmlFor="personalLocation">Location</label>
                      <input
                        type="text"
                        id="personalLocation"
                        className={styles["form-control"]}
                        placeholder="City, Country"
                        value={personalInfo.location}
                        onChange={(e) =>
                          updatePersonalInfo("location", e.target.value)
                        }
                      />
                    </div>
                    <div className={styles["form-group"]}>
                      <label htmlFor="personalWebsite">Website</label>
                      <input
                        type="url"
                        id="personalWebsite"
                        className={styles["form-control"]}
                        placeholder="https://yourwebsite.com"
                        value={personalInfo.website}
                        onChange={(e) =>
                          updatePersonalInfo("website", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className={styles["form-section"]}>
                  <h3 className={styles["form-section-title"]}>
                    Social Media Links
                  </h3>
                  <div className={styles.formNote}>
                    <p>
                      <i className="fas fa-info-circle"></i>{" "}
                      <strong>Note:</strong> All social media links must begin
                      with https:// to work properly. The system will
                      automatically add this prefix if missing.
                    </p>
                  </div>
                  <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                      <label htmlFor="personalLinkedin">LinkedIn URL</label>
                      <input
                        type="url"
                        id="personalLinkedin"
                        className={styles["form-control"]}
                        placeholder="https://www.linkedin.com/in/your-profile-id"
                        value={personalInfo.socialLinks.linkedin}
                        onChange={(e) =>
                          updatePersonalInfo(
                            "socialLinks.linkedin",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className={styles["form-group"]}>
                      <label htmlFor="personalGithub">GitHub URL</label>
                      <input
                        type="url"
                        id="personalGithub"
                        className={styles["form-control"]}
                        placeholder="https://github.com/yourusername"
                        value={personalInfo.socialLinks.github}
                        onChange={(e) =>
                          updatePersonalInfo(
                            "socialLinks.github",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className={styles["form-row"]}>
                    <div className={styles["form-group"]}>
                      <label htmlFor="personalTwitter">Twitter URL</label>
                      <input
                        type="url"
                        id="personalTwitter"
                        className={styles["form-control"]}
                        placeholder="https://twitter.com/yourusername"
                        value={personalInfo.socialLinks.twitter}
                        onChange={(e) =>
                          updatePersonalInfo(
                            "socialLinks.twitter",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className={styles["form-group"]}>
                      <label htmlFor="personalInstagram">Instagram URL</label>
                      <input
                        type="url"
                        id="personalInstagram"
                        className={styles["form-control"]}
                        placeholder="https://www.instagram.com/yourusername"
                        value={personalInfo.socialLinks.instagram}
                        onChange={(e) =>
                          updatePersonalInfo(
                            "socialLinks.instagram",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Education Section */}
          <div
            id="educationEditor"
            className={`${styles["content-section"]} ${
              activeSection === "education" ? styles["active"] : ""
            }`}
          >
            <div className={styles["content-editor"]}>
              <div className={styles["editor-header"]}>
                <h2>Edit Education</h2>
                <div className={styles["editor-actions"]}>
                  <button
                    className={`${styles["action-btn"]} ${styles["save"]}`}
                    onClick={saveEducationChanges}
                  >
                    Save Changes
                  </button>
                  <button
                    className={`${styles["action-btn"]} ${styles["cancel"]}`}
                    onClick={() => changeSection("dashboard")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div className={styles["editor-content"]}>
                <div className={styles["form-section"]}>
                  <h3 className={styles["form-section-title"]}>
                    Education Entries
                  </h3>

                  {educationEntries.length === 0 ? (
                    <div className={styles["no-entries"]}>
                      <p>
                        No education entries yet. Click the button below to add
                        your first education entry.
                      </p>
                    </div>
                  ) : (
                    <div id="educationEntries">
                      {educationEntries.map((entry, index) => (
                        <div className={styles["education-entry"]} key={index}>
                          <div className={styles["entry-header"]}>
                            <h4 className={styles["entry-title"]}>
                              {entry.degree
                                ? entry.degree
                                : `Education Entry #${index + 1}`}
                              {entry.institution && (
                                <span className={styles["entry-subtitle"]}>
                                  {" "}
                                  at {entry.institution}
                                </span>
                              )}
                            </h4>
                            <div className={styles["entry-actions"]}>
                              <button
                                className={styles["entry-btn"]}
                                title="Move entry up"
                                onClick={() => {
                                  if (index > 0) {
                                    const updated = [...educationEntries];
                                    [updated[index], updated[index - 1]] = [
                                      updated[index - 1],
                                      updated[index],
                                    ];
                                    setEducationEntries(updated);
                                  }
                                }}
                                disabled={index === 0}
                              >
                                <i className="fas fa-arrow-up"></i>
                              </button>
                              <button
                                className={styles["entry-btn"]}
                                title="Move entry down"
                                onClick={() => {
                                  if (index < educationEntries.length - 1) {
                                    const updated = [...educationEntries];
                                    [updated[index], updated[index + 1]] = [
                                      updated[index + 1],
                                      updated[index],
                                    ];
                                    setEducationEntries(updated);
                                  }
                                }}
                                disabled={index === educationEntries.length - 1}
                              >
                                <i className="fas fa-arrow-down"></i>
                              </button>
                              <button
                                className={styles["delete-entry"]}
                                title="Delete this entry"
                                onClick={() => confirmDeleteEducation(index)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                          <div className={styles["form-row"]}>
                            <div className={styles["form-group"]}>
                              <label htmlFor={`degree-${index}`}>
                                Degree/Certificate
                              </label>
                              <input
                                type="text"
                                id={`degree-${index}`}
                                className={`${styles["form-control"]} ${styles["degree"]}`}
                                placeholder="e.g. Bachelor of Science"
                                value={entry.degree}
                                onChange={(e) =>
                                  updateEducationEntry(
                                    index,
                                    "degree",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className={styles["form-group"]}>
                              <label htmlFor={`field-${index}`}>
                                Field of Study
                              </label>
                              <input
                                type="text"
                                id={`field-${index}`}
                                className={`${styles["form-control"]} ${styles["field"]}`}
                                placeholder="e.g. Computer Science"
                                value={entry.field}
                                onChange={(e) =>
                                  updateEducationEntry(
                                    index,
                                    "field",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className={styles["form-row"]}>
                            <div className={styles["form-group"]}>
                              <label htmlFor={`institution-${index}`}>
                                Institution
                              </label>
                              <input
                                type="text"
                                id={`institution-${index}`}
                                className={`${styles["form-control"]} ${styles["institution"]}`}
                                placeholder="e.g. University of Example"
                                value={entry.institution}
                                onChange={(e) =>
                                  updateEducationEntry(
                                    index,
                                    "institution",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className={styles["form-group"]}>
                              <label htmlFor={`location-${index}`}>
                                Location
                              </label>
                              <input
                                type="text"
                                id={`location-${index}`}
                                className={`${styles["form-control"]} ${styles["location"]}`}
                                placeholder="e.g. New York, NY"
                                value={entry.location}
                                onChange={(e) =>
                                  updateEducationEntry(
                                    index,
                                    "location",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className={styles["form-row"]}>
                            <div className={styles["form-group"]}>
                              <label htmlFor={`startDate-${index}`}>
                                Start Date
                              </label>
                              <input
                                type="month"
                                id={`startDate-${index}`}
                                className={`${styles["form-control"]} ${styles["startDate"]}`}
                                value={entry.startDate}
                                onChange={(e) =>
                                  updateEducationEntry(
                                    index,
                                    "startDate",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className={styles["form-group"]}>
                              <label htmlFor={`endDate-${index}`}>
                                End Date
                              </label>
                              <input
                                type="month"
                                id={`endDate-${index}`}
                                className={`${styles["form-control"]} ${styles["endDate"]}`}
                                value={entry.endDate}
                                onChange={(e) =>
                                  updateEducationEntry(
                                    index,
                                    "endDate",
                                    e.target.value
                                  )
                                }
                                disabled={entry.current}
                              />
                              <div className={styles["checkbox-container"]}>
                                <input
                                  type="checkbox"
                                  id={`currentEducation-${index}`}
                                  className={styles["current"]}
                                  checked={entry.current}
                                  onChange={(e) =>
                                    updateEducationEntry(
                                      index,
                                      "current",
                                      e.target.checked
                                    )
                                  }
                                />
                                <label htmlFor={`currentEducation-${index}`}>
                                  Currently studying here
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className={styles["form-group"]}>
                            <label htmlFor={`description-${index}`}>
                              Description
                            </label>
                            <textarea
                              id={`description-${index}`}
                              className={`${styles["form-control"]} ${styles["description"]}`}
                              rows="4"
                              placeholder="Describe your studies, achievements, etc."
                              value={entry.description}
                              onChange={(e) =>
                                updateEducationEntry(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                            ></textarea>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className={styles["add-new-container"]}>
                    <button
                      id="addEducationBtn"
                      className={styles["action-btn"]}
                      onClick={addEducationEntry}
                    >
                      <i className="fas fa-plus"></i> Add New Education
                    </button>
                  </div>

                  {/* Delete Confirmation Dialog */}
                  {showDeleteEducationConfirm && (
                    <div className={styles["confirmation-dialog"]}>
                      <div className={styles["confirmation-content"]}>
                        <h3>Confirm Deletion</h3>
                        <p>
                          Are you sure you want to delete this education entry?
                          This action cannot be undone.
                        </p>
                        <div className={styles["confirmation-actions"]}>
                          <button
                            className={`${styles["action-btn"]} ${styles["cancel"]}`}
                            onClick={cancelDeleteEducation}
                          >
                            Cancel
                          </button>
                          <button
                            className={`${styles["action-btn"]} ${styles["delete"]}`}
                            onClick={deleteEducationEntry}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Experience Editor */}
          <div
            id="experienceEditor"
            className={`${styles["content-section"]} ${
              activeSection === "experience" ? styles["active"] : ""
            }`}
          >
            <div className={styles["content-editor"]}>
              <div className={styles["editor-header"]}>
                <h2>Edit Experience</h2>
                <div className={styles["editor-actions"]}>
                  <button
                    className={`${styles["action-btn"]} ${styles["save"]}`}
                    onClick={saveExperienceChanges}
                  >
                    Save Changes
                  </button>
                  <button
                    className={`${styles["action-btn"]} ${styles["cancel"]}`}
                    onClick={() => changeSection("dashboard")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div className={styles["editor-content"]}>
                <div className={styles["form-section"]}>
                  <h3 className={styles["form-section-title"]}>
                    Work Experience
                  </h3>
                  <div id="experienceEntries">
                    {experienceEntries.map((entry, index) => (
                      <div className={styles["education-entry"]} key={index}>
                        <div className={styles["entry-header"]}>
                          <h4 className={styles["entry-title"]}>
                            Experience Entry #{index + 1}
                          </h4>
                          <button
                            className={styles["delete-entry"]}
                            title="Delete this experience"
                            onClick={() => deleteExperienceEntry(index)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>

                        <div className={styles["form-row"]}>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`jobTitle-${index}`}>
                              Job Title
                            </label>
                            <input
                              type="text"
                              id={`jobTitle-${index}`}
                              className={`${styles["form-control"]} ${styles["jobTitle"]}`}
                              placeholder="e.g. Senior Developer"
                              value={entry.position}
                              onChange={(e) =>
                                updateExperienceEntry(
                                  index,
                                  "position",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`company-${index}`}>Company</label>
                            <input
                              type="text"
                              id={`company-${index}`}
                              className={`${styles["form-control"]} ${styles["company"]}`}
                              placeholder="e.g. Tech Company Inc."
                              value={entry.company}
                              onChange={(e) =>
                                updateExperienceEntry(
                                  index,
                                  "company",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className={styles["form-row"]}>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`jobLocation-${index}`}>
                              Location
                            </label>
                            <input
                              type="text"
                              id={`jobLocation-${index}`}
                              className={`${styles["form-control"]} ${styles["jobLocation"]}`}
                              placeholder="e.g. New York, NY"
                              value={entry.location}
                              onChange={(e) =>
                                updateExperienceEntry(
                                  index,
                                  "location",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`employmentPeriod-${index}`}>
                              Period
                            </label>
                            <input
                              type="text"
                              id={`employmentPeriod-${index}`}
                              className={`${styles["form-control"]} ${styles["employmentPeriod"]}`}
                              placeholder="e.g. 2020 - Present"
                              value={entry.period}
                              onChange={(e) =>
                                updateExperienceEntry(
                                  index,
                                  "period",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className={styles["form-group"]}>
                          <label htmlFor={`jobDescription-${index}`}>
                            Description
                          </label>
                          <textarea
                            id={`jobDescription-${index}`}
                            className={`${styles["form-control"]} ${styles["jobDescription"]}`}
                            rows="4"
                            placeholder="Describe your responsibilities and achievements"
                            value={entry.description}
                            onChange={(e) =>
                              updateExperienceEntry(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                          ></textarea>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles["add-new-container"]}>
                    <button
                      id="addExperienceBtn"
                      className={styles["action-btn"]}
                      onClick={addExperienceEntry}
                    >
                      <i className="fas fa-plus"></i> Add New Experience
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Editor */}
          <div
            id="skillsEditor"
            className={`${styles["content-section"]} ${
              activeSection === "skills" ? styles["active"] : ""
            }`}
          >
            <div className={styles["content-editor"]}>
              <div className={styles["editor-header"]}>
                <h2>Edit Skills</h2>
                <div className={styles["editor-actions"]}>
                  <button
                    className={`${styles["action-btn"]} ${styles["save"]}`}
                    onClick={saveSkillsChanges}
                  >
                    Save Changes
                  </button>
                  <button
                    className={`${styles["action-btn"]} ${styles["cancel"]}`}
                    onClick={() => changeSection("dashboard")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div className={styles["editor-content"]}>
                <div className={styles["form-section"]}>
                  <h3 className={styles["form-section-title"]}>
                    Technical Skills
                  </h3>
                  <div id="technicalSkills">
                    {skillsData.technical.map((skill, index) => (
                      <div className={styles["skill-entry"]} key={index}>
                        <div className={styles["entry-header"]}>
                          <h4 className={styles["entry-title"]}>
                            Skill #{index + 1}
                          </h4>
                          <button
                            className={styles["delete-entry"]}
                            title="Delete this skill"
                            onClick={() => deleteSkill("technical", index)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                        <div className={styles["form-row"]}>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`skillName-${index}`}>
                              Skill Name
                            </label>
                            <input
                              type="text"
                              id={`skillName-${index}`}
                              className={`${styles["form-control"]} ${styles["skillName"]}`}
                              placeholder="e.g. JavaScript"
                              value={skill.name}
                              onChange={(e) =>
                                updateSkill(
                                  "technical",
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`skillLevel-${index}`}>
                              Proficiency Level
                            </label>
                            <select
                              id={`skillLevel-${index}`}
                              className={styles["form-control"]}
                              value={skill.level}
                              onChange={(e) =>
                                updateSkill(
                                  "technical",
                                  index,
                                  "level",
                                  e.target.value
                                )
                              }
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                              <option value="expert">Expert</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles["add-new-container"]}>
                    <button
                      id="addTechnicalSkillBtn"
                      className={styles["action-btn"]}
                      onClick={() => addSkill("technical")}
                    >
                      <i className="fas fa-plus"></i> Add Technical Skill
                    </button>
                  </div>
                </div>

                <div className={styles["form-section"]}>
                  <h3 className={styles["form-section-title"]}>Soft Skills</h3>
                  <div id="softSkills">
                    {skillsData.soft.map((skill, index) => (
                      <div className={styles["skill-entry"]} key={index}>
                        <div className={styles["entry-header"]}>
                          <h4 className={styles["entry-title"]}>
                            Soft Skill #{index + 1}
                          </h4>
                          <button
                            className={styles["delete-entry"]}
                            title="Delete this skill"
                            onClick={() => deleteSkill("soft", index)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                        <div className={styles["form-group"]}>
                          <label htmlFor={`softSkillName-${index}`}>
                            Skill Name
                          </label>
                          <input
                            type="text"
                            id={`softSkillName-${index}`}
                            className={`${styles["form-control"]} ${styles["skillName"]}`}
                            placeholder="e.g. Communication"
                            value={skill.name}
                            onChange={(e) =>
                              updateSkill("soft", index, "name", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles["add-new-container"]}>
                    <button
                      id="addSoftSkillBtn"
                      className={styles["action-btn"]}
                      onClick={() => addSkill("soft")}
                    >
                      <i className="fas fa-plus"></i> Add Soft Skill
                    </button>
                  </div>
                </div>

                <div className={styles["form-section"]}>
                  <h3 className={styles["form-section-title"]}>Languages</h3>
                  <div id="languageSkills">
                    {skillsData.languages.map((skill, index) => (
                      <div className={styles["skill-entry"]} key={index}>
                        <div className={styles["entry-header"]}>
                          <h4 className={styles["entry-title"]}>
                            Language #{index + 1}
                          </h4>
                          <button
                            className={styles["delete-entry"]}
                            title="Delete this language"
                            onClick={() => deleteSkill("languages", index)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                        <div className={styles["form-row"]}>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`languageName-${index}`}>
                              Language
                            </label>
                            <input
                              type="text"
                              id={`languageName-${index}`}
                              className={`${styles["form-control"]} ${styles["skillName"]}`}
                              placeholder="e.g. English"
                              value={skill.name}
                              onChange={(e) =>
                                updateSkill(
                                  "languages",
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`languageLevel-${index}`}>
                              Proficiency Level
                            </label>
                            <select
                              id={`languageLevel-${index}`}
                              className={styles["form-control"]}
                              value={skill.level}
                              onChange={(e) =>
                                updateSkill(
                                  "languages",
                                  index,
                                  "level",
                                  e.target.value
                                )
                              }
                            >
                              <option value="elementary">Elementary</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                              <option value="native">Native</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles["add-new-container"]}>
                    <button
                      id="addLanguageBtn"
                      className={styles["action-btn"]}
                      onClick={() => addSkill("languages")}
                    >
                      <i className="fas fa-plus"></i> Add Language
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Highlights Editor */}
          <div
            id="highlightsEditor"
            className={`${styles["content-section"]} ${
              activeSection === "highlights" ? styles["active"] : ""
            }`}
          >
            <div className={styles["content-editor"]}>
              <div className={styles["editor-header"]}>
                <h2>Edit Highlights</h2>
                <div className={styles["editor-actions"]}>
                  <button
                    className={`${styles["action-btn"]} ${styles["save"]}`}
                    onClick={saveHighlightChanges}
                  >
                    Save Changes
                  </button>
                  <button
                    className={`${styles["action-btn"]} ${styles["cancel"]}`}
                    onClick={() => changeSection("dashboard")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div className={styles["editor-content"]}>
                <div className={styles["form-section"]}>
                  <h3 className={styles["form-section-title"]}>
                    Career Highlights
                  </h3>
                  <div id="highlightEntries">
                    {highlightEntries.map((entry, index) => (
                      <div className={styles["education-entry"]} key={index}>
                        <div className={styles["entry-header"]}>
                          <h4 className={styles["entry-title"]}>
                            Highlight Entry #{index + 1}
                          </h4>
                          <button
                            className={styles["delete-entry"]}
                            title="Delete this highlight"
                            onClick={() => deleteHighlightEntry(index)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>

                        <div className={styles["form-group"]}>
                          <label htmlFor={`highlightTitle-${index}`}>
                            Title
                          </label>
                          <input
                            type="text"
                            id={`highlightTitle-${index}`}
                            className={`${styles["form-control"]} ${styles["highlightTitle"]}`}
                            placeholder="e.g. Award or Achievement"
                            value={entry.title}
                            onChange={(e) =>
                              updateHighlightEntry(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className={styles["form-row"]}>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`highlightDate-${index}`}>
                              Date
                            </label>
                            <input
                              type="month"
                              id={`highlightDate-${index}`}
                              className={`${styles["form-control"]} ${styles["highlightDate"]}`}
                              value={entry.date}
                              onChange={(e) =>
                                updateHighlightEntry(
                                  index,
                                  "date",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`highlightCategory-${index}`}>
                              Category
                            </label>
                            <select
                              id={`highlightCategory-${index}`}
                              className={`${styles["form-control"]} ${styles["highlightCategory"]}`}
                              value={entry.category}
                              onChange={(e) =>
                                updateHighlightEntry(
                                  index,
                                  "category",
                                  e.target.value
                                )
                              }
                            >
                              <option value="award">Award</option>
                              <option value="achievement">Achievement</option>
                              <option value="publication">Publication</option>
                              <option value="recognition">Recognition</option>
                            </select>
                          </div>
                        </div>

                        <div className={styles["form-group"]}>
                          <label htmlFor={`highlightDescription-${index}`}>
                            Description
                          </label>
                          <textarea
                            id={`highlightDescription-${index}`}
                            className={`${styles["form-control"]} ${styles["highlightDescription"]}`}
                            rows="4"
                            placeholder="Describe the highlight and its significance"
                            value={entry.description}
                            onChange={(e) =>
                              updateHighlightEntry(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                          ></textarea>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles["add-new-container"]}>
                    <button
                      id="addHighlightBtn"
                      className={styles["action-btn"]}
                      onClick={addHighlightEntry}
                    >
                      <i className="fas fa-plus"></i> Add New Highlight
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Editor */}
          <div
            id="projectsEditor"
            className={`${styles["content-section"]} ${
              activeSection === "projects" ? styles["active"] : ""
            }`}
          >
            <div className={styles["content-editor"]}>
              <div className={styles["editor-header"]}>
                <h2>Edit Projects</h2>
                <div className={styles["editor-actions"]}>
                  <button
                    className={`${styles["action-btn"]} ${styles["save"]}`}
                    onClick={saveProjectChanges}
                  >
                    Save Changes
                  </button>
                  <button
                    className={`${styles["action-btn"]} ${styles["cancel"]}`}
                    onClick={() => changeSection("dashboard")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div className={styles["editor-content"]}>
                <div className={styles["form-section"]}>
                  <h3 className={styles["form-section-title"]}>
                    Portfolio Projects
                  </h3>
                  <div id="projectEntries">
                    {projectEntries.map((entry, index) => (
                      <div className={styles["project-entry"]} key={index}>
                        <div className={styles["entry-header"]}>
                          <h4 className={styles["entry-title"]}>
                            Project Entry #{index + 1}
                          </h4>
                          <button
                            className={styles["delete-entry"]}
                            title="Delete this project"
                            onClick={() => deleteProjectEntry(index)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>

                        <div className={styles["form-row"]}>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`projectTitle-${index}`}>
                              Project Title
                            </label>
                            <input
                              type="text"
                              id={`projectTitle-${index}`}
                              className={`${styles["form-control"]} ${styles["projectTitle"]}`}
                              placeholder="e.g. E-commerce Website"
                              value={entry.title}
                              onChange={(e) =>
                                updateProjectEntry(
                                  index,
                                  "title",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`projectCategory-${index}`}>
                              Category
                            </label>
                            <input
                              type="text"
                              id={`projectCategory-${index}`}
                              className={`${styles["form-control"]} ${styles["projectCategory"]}`}
                              placeholder="e.g. Web Development"
                              value={entry.category}
                              onChange={(e) =>
                                updateProjectEntry(
                                  index,
                                  "category",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className={styles["form-group"]}>
                          <label htmlFor={`projectDescription-${index}`}>
                            Description
                          </label>
                          <textarea
                            id={`projectDescription-${index}`}
                            className={`${styles["form-control"]} ${styles["projectDescription"]}`}
                            rows="4"
                            placeholder="Describe the project, its features, and your role in it"
                            value={entry.description}
                            onChange={(e) =>
                              updateProjectEntry(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                          ></textarea>
                        </div>

                        <div className={styles["form-row"]}>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`projectImage-${index}`}>
                              Project Image
                            </label>
                            <div className={styles["image-upload-container"]}>
                              <div className={styles["current-image"]}>
                                {entry.image ? (
                                  <img
                                    src={entry.image}
                                    alt={entry.title || "Project"}
                                    className={styles["preview-image"]}
                                  />
                                ) : (
                                  <div className={styles["no-image"]}>
                                    <i className="fas fa-image"></i>
                                    <span>No image</span>
                                  </div>
                                )}
                              </div>
                              <div className={styles["upload-controls"]}>
                                <input
                                  type="file"
                                  id={`projectImage-${index}`}
                                  className={styles["file-input"]}
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const file = e.target.files[0];
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        if (
                                          typeof event.target?.result ===
                                          "string"
                                        ) {
                                          updateProjectEntry(
                                            index,
                                            "image",
                                            event.target.result
                                          );
                                          showNotification(
                                            `Image for ${entry.title} updated successfully!`
                                          );
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`projectImage-${index}`}
                                  className={styles["upload-btn"]}
                                >
                                  <i className="fas fa-upload"></i> Upload Image
                                </label>
                                {entry.image && (
                                  <button
                                    className={`${styles["action-btn"]} ${styles["delete"]}`}
                                    onClick={() =>
                                      updateProjectEntry(index, "image", null)
                                    }
                                  >
                                    <i className="fas fa-trash-alt"></i> Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`projectDemo-${index}`}>
                              Demo URL
                            </label>
                            <input
                              type="url"
                              id={`projectDemo-${index}`}
                              className={`${styles["form-control"]} ${styles["projectDemo"]}`}
                              placeholder="URL to a live demo"
                              value={entry.demoUrl}
                              onChange={(e) =>
                                updateProjectEntry(
                                  index,
                                  "demoUrl",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className={styles["form-row"]}>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`projectRepo-${index}`}>
                              Repository URL
                            </label>
                            <input
                              type="url"
                              id={`projectRepo-${index}`}
                              className={`${styles["form-control"]} ${styles["projectRepo"]}`}
                              placeholder="URL to the code repository"
                              value={entry.repoUrl}
                              onChange={(e) =>
                                updateProjectEntry(
                                  index,
                                  "repoUrl",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`projectDate-${index}`}>
                              Completion Date
                            </label>
                            <input
                              type="month"
                              id={`projectDate-${index}`}
                              className={`${styles["form-control"]} ${styles["projectDate"]}`}
                              value={entry.date}
                              onChange={(e) =>
                                updateProjectEntry(
                                  index,
                                  "date",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className={styles["form-group"]}>
                          <label htmlFor={`projectTechnologies-${index}`}>
                            Technologies Used
                          </label>
                          <input
                            type="text"
                            id={`projectTechnologies-${index}`}
                            className={`${styles["form-control"]} ${styles["projectTechnologies"]}`}
                            placeholder="e.g. HTML, CSS, JavaScript, React"
                            value={entry.technologies}
                            onChange={(e) =>
                              updateProjectEntry(
                                index,
                                "technologies",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles["add-new-container"]}>
                    <button
                      id="addProjectBtn"
                      className={styles["action-btn"]}
                      onClick={addProjectEntry}
                    >
                      <i className="fas fa-plus"></i> Add New Project
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pictures Editor */}
          <div
            id="picturesEditor"
            className={`${styles["content-section"]} ${
              activeSection === "pictures" ? styles["active"] : ""
            }`}
          >
            <div className={styles["content-editor"]}>
              <div className={styles["editor-header"]}>
                <h2>Edit Pictures</h2>
                <div className={styles["editor-actions"]}>
                  <button
                    className={`${styles["action-btn"]} ${styles["save"]}`}
                    onClick={savePictureChanges}
                  >
                    Save Changes
                  </button>
                  <button
                    className={`${styles["action-btn"]} ${styles["cancel"]}`}
                    onClick={() => changeSection("dashboard")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div className={styles["editor-content"]}>
                <div className={styles["form-section"]}>
                  <h3 className={styles["form-section-title"]}>
                    Photography Collection
                  </h3>
                  <div id="pictureEntries">
                    {pictureEntries.map((entry, index) => (
                      <div className={styles["education-entry"]} key={index}>
                        <div className={styles["entry-header"]}>
                          <h4 className={styles["entry-title"]}>
                            Picture Entry #{index + 1}
                          </h4>
                          <button
                            className={styles["delete-entry"]}
                            title="Delete this picture"
                            onClick={() => deletePictureEntry(index)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>

                        <div className={styles["form-row"]}>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`pictureTitle-${index}`}>
                              Title
                            </label>
                            <input
                              type="text"
                              id={`pictureTitle-${index}`}
                              className={`${styles["form-control"]} ${styles["pictureTitle"]}`}
                              placeholder="e.g. Mountain Sunrise"
                              value={entry.title}
                              onChange={(e) =>
                                updatePictureEntry(
                                  index,
                                  "title",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`pictureCategory-${index}`}>
                              Category
                            </label>
                            <input
                              type="text"
                              id={`pictureCategory-${index}`}
                              className={`${styles["form-control"]} ${styles["pictureCategory"]}`}
                              placeholder="e.g. Landscape"
                              value={entry.category}
                              onChange={(e) =>
                                updatePictureEntry(
                                  index,
                                  "category",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className={styles["form-group"]}>
                          <label htmlFor={`pictureDescription-${index}`}>
                            Description
                          </label>
                          <textarea
                            id={`pictureDescription-${index}`}
                            className={`${styles["form-control"]} ${styles["pictureDescription"]}`}
                            rows="4"
                            placeholder="Describe the picture"
                            value={entry.description}
                            onChange={(e) =>
                              updatePictureEntry(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                          ></textarea>
                        </div>

                        <div className={styles["form-row"]}>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`pictureImage-${index}`}>
                              Image
                            </label>
                            <div className={styles["image-upload-container"]}>
                              <div className={styles["current-image"]}>
                                {entry.image ? (
                                  <img
                                    src={entry.image}
                                    alt={entry.title || "Picture"}
                                    className={styles["preview-image"]}
                                  />
                                ) : (
                                  <div className={styles["no-image"]}>
                                    <i className="fas fa-image"></i>
                                    <span>No image</span>
                                  </div>
                                )}
                              </div>
                              <div className={styles["upload-controls"]}>
                                <input
                                  type="file"
                                  id={`pictureImage-${index}`}
                                  className={styles["file-input"]}
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const file = e.target.files[0];
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        if (
                                          typeof event.target?.result ===
                                          "string"
                                        ) {
                                          updatePictureEntry(
                                            index,
                                            "image",
                                            event.target.result
                                          );
                                          showNotification(
                                            `Image for ${entry.title} updated successfully!`
                                          );
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`pictureImage-${index}`}
                                  className={styles["upload-btn"]}
                                >
                                  <i className="fas fa-upload"></i> Upload Image
                                </label>
                                {entry.image && (
                                  <button
                                    className={`${styles["action-btn"]} ${styles["delete"]}`}
                                    onClick={() =>
                                      updatePictureEntry(index, "image", null)
                                    }
                                  >
                                    <i className="fas fa-trash-alt"></i> Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`pictureLink-${index}`}>
                              Full Size Link
                            </label>
                            <input
                              type="url"
                              id={`pictureLink-${index}`}
                              className={`${styles["form-control"]} ${styles["pictureLink"]}`}
                              placeholder="URL to full size image"
                              value={entry.link}
                              onChange={(e) =>
                                updatePictureEntry(
                                  index,
                                  "link",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles["add-new-container"]}>
                    <button
                      id="addPictureBtn"
                      className={styles["action-btn"]}
                      onClick={addPictureEntry}
                    >
                      <i className="fas fa-plus"></i> Add New Picture
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* References Editor */}
          <div
            id="referencesEditor"
            className={`${styles["content-section"]} ${
              activeSection === "references" ? styles["active"] : ""
            }`}
          >
            <div className={styles["content-editor"]}>
              <div className={styles["editor-header"]}>
                <h2>Edit References</h2>
                <div className={styles["editor-actions"]}>
                  <button
                    className={`${styles["action-btn"]} ${styles["save"]}`}
                    onClick={saveReferenceChanges}
                  >
                    Save Changes
                  </button>
                  <button
                    className={`${styles["action-btn"]} ${styles["cancel"]}`}
                    onClick={() => changeSection("dashboard")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div className={styles["editor-content"]}>
                <div className={styles["form-section"]}>
                  <h3 className={styles["form-section-title"]}>
                    Professional References
                  </h3>
                  <div id="referenceEntries">
                    {referenceEntries.map((entry, index) => (
                      <div className={styles["education-entry"]} key={index}>
                        <div className={styles["entry-header"]}>
                          <h4 className={styles["entry-title"]}>
                            Reference Entry #{index + 1}
                          </h4>
                          <button
                            className={styles["delete-entry"]}
                            title="Delete this reference"
                            onClick={() => deleteReferenceEntry(index)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>

                        <div className={styles["form-row"]}>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`referenceName-${index}`}>
                              Name
                            </label>
                            <input
                              type="text"
                              id={`referenceName-${index}`}
                              className={`${styles["form-control"]} ${styles["referenceName"]}`}
                              placeholder="e.g. Sarah Johnson"
                              value={entry.name}
                              onChange={(e) =>
                                updateReferenceEntry(
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`referencePosition-${index}`}>
                              Position
                            </label>
                            <input
                              type="text"
                              id={`referencePosition-${index}`}
                              className={`${styles["form-control"]} ${styles["referencePosition"]}`}
                              placeholder="e.g. CTO"
                              value={entry.position}
                              onChange={(e) =>
                                updateReferenceEntry(
                                  index,
                                  "position",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className={styles["form-row"]}>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`referenceCompany-${index}`}>
                              Company
                            </label>
                            <input
                              type="text"
                              id={`referenceCompany-${index}`}
                              className={`${styles["form-control"]} ${styles["referenceCompany"]}`}
                              placeholder="e.g. Tech Innovations Inc."
                              value={entry.company}
                              onChange={(e) =>
                                updateReferenceEntry(
                                  index,
                                  "company",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className={styles["form-group"]}>
                            <label htmlFor={`referenceImage-${index}`}>
                              Image
                            </label>
                            <div className={styles["image-upload-container"]}>
                              <div className={styles["current-image"]}>
                                {entry.image ? (
                                  <img
                                    src={entry.image}
                                    alt={entry.name || "Reference"}
                                    className={styles["preview-image"]}
                                  />
                                ) : (
                                  <div className={styles["no-image"]}>
                                    <i className="fas fa-image"></i>
                                    <span>No image</span>
                                  </div>
                                )}
                              </div>
                              <div className={styles["upload-controls"]}>
                                <input
                                  type="file"
                                  id={`referenceImage-${index}`}
                                  className={styles["file-input"]}
                                  accept="image/*"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const file = e.target.files[0];
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        if (
                                          typeof event.target?.result ===
                                          "string"
                                        ) {
                                          updateReferenceEntry(
                                            index,
                                            "image",
                                            event.target.result
                                          );
                                          showNotification(
                                            `Image for ${entry.name} updated successfully!`
                                          );
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`referenceImage-${index}`}
                                  className={styles["upload-btn"]}
                                >
                                  <i className="fas fa-upload"></i> Upload Image
                                </label>
                                {entry.image && (
                                  <button
                                    className={`${styles["action-btn"]} ${styles["delete"]}`}
                                    onClick={() =>
                                      updateReferenceEntry(index, "image", null)
                                    }
                                  >
                                    <i className="fas fa-trash-alt"></i> Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className={styles["form-group"]}>
                          <label htmlFor={`referenceQuote-${index}`}>
                            Quote
                          </label>
                          <textarea
                            id={`referenceQuote-${index}`}
                            className={`${styles["form-control"]} ${styles["referenceQuote"]}`}
                            rows="4"
                            placeholder="Enter a quote from the reference"
                            value={entry.quote}
                            onChange={(e) =>
                              updateReferenceEntry(
                                index,
                                "quote",
                                e.target.value
                              )
                            }
                          ></textarea>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles["add-new-container"]}>
                    <button
                      id="addReferenceBtn"
                      className={styles["action-btn"]}
                      onClick={addReferenceEntry}
                    >
                      <i className="fas fa-plus"></i> Add New Reference
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Editor */}
          <div
            id="settingsEditor"
            className={`${styles["content-section"]} ${
              activeSection === "settings" ? styles["active"] : ""
            }`}
          >
            <div className={styles["content-editor"]}>
              <div className={styles["editor-header"]}>
                <h2>Settings</h2>
                <div className={styles["editor-actions"]}>
                  <button
                    className={`${styles["action-btn"]} ${styles["save"]}`}
                    onClick={() => {
                      saveSettingsChanges();
                      if (
                        passwordForm.currentPassword ||
                        passwordForm.newPassword ||
                        passwordForm.confirmPassword
                      ) {
                        handlePasswordChange();
                      }
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    className={`${styles["action-btn"]} ${styles["cancel"]}`}
                    onClick={() => changeSection("dashboard")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div className={styles["editor-content"]}>
                {/* Account Settings */}
                <div className={styles["form-section"]}>
                  <h3 className={styles["form-section-title"]}>
                    Account Settings
                  </h3>

                  <div className={styles["form-group"]}>
                    <label htmlFor="settingsUsername">Username</label>
                    <input
                      type="text"
                      id="settingsUsername"
                      className={styles["form-control"]}
                      placeholder="Your username"
                      value={settingsData.auth?.username || ""}
                      onChange={(e) =>
                        updateAuthSettings("username", e.target.value)
                      }
                    />
                  </div>

                  <div className={styles["form-group"]}>
                    <label htmlFor="settingsEmail">Email</label>
                    <input
                      type="email"
                      id="settingsEmail"
                      className={styles["form-control"]}
                      placeholder="Your email address"
                      value={settingsData.auth?.email || ""}
                      onChange={(e) =>
                        updateAuthSettings("email", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Password Change */}
                <div className={styles["form-section"]}>
                  <h3 className={styles["form-section-title"]}>
                    Change Password
                  </h3>

                  <div className={styles["form-group"]}>
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      className={styles["form-control"]}
                      placeholder="Enter your current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        updatePasswordForm("currentPassword", e.target.value)
                      }
                    />
                  </div>

                  <div className={styles["form-group"]}>
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      className={styles["form-control"]}
                      placeholder="Enter your new password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        updatePasswordForm("newPassword", e.target.value)
                      }
                    />
                  </div>

                  <div className={styles["form-group"]}>
                    <label htmlFor="confirmPassword">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      className={styles["form-control"]}
                      placeholder="Confirm your new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        updatePasswordForm("confirmPassword", e.target.value)
                      }
                    />
                  </div>

                  {passwordError && (
                    <div className={styles["error-message"]}>
                      {passwordError}
                    </div>
                  )}
                </div>

                {/* Data Management Section */}
                <div className={styles["form-section"]}>
                  <h3 className={styles["form-section-title"]}>
                    Data Management
                  </h3>
                  
                  <div className={styles["cloud-sync-section"]}>
                    <h4>Real-Time Cloud Sync</h4>
                    <p>
                      Enable cloud synchronization to make your portfolio data available in real-time across all devices and on your live website.
                      When enabled, changes you make here will be immediately visible on your live site.
                    </p>
                    
                    <div className={styles["toggle-container"]}>
                      <label className={styles["switch"]}>
                        <input
                          type="checkbox"
                          checked={cloudSyncEnabled}
                          onChange={(e) => {
                            const newValue = e.target.checked;
                            setCloudSyncEnabled(newValue);
                            portfolioService.toggleCloudSync(newValue)
                              .then(success => {
                                if (success) {
                                  showNotification(
                                    `Cloud sync ${newValue ? 'enabled' : 'disabled'} successfully`,
                                    "success"
                                  );
                                } else {
                                  // If toggle failed, revert back
                                  setCloudSyncEnabled(!newValue);
                                  showNotification(
                                    `Failed to ${newValue ? 'enable' : 'disable'} cloud sync`,
                                    "error"
                                  );
                                }
                              })
                              .catch(error => {
                                console.error("Error toggling cloud sync:", error);
                                // If toggle failed, revert back
                                setCloudSyncEnabled(!newValue);
                                showNotification(
                                  `Error toggling cloud sync: ${error.message}`,
                                  "error"
                                );
                              });
                          }}
                        />
                        <span className={styles["slider"]}></span>
                      </label>
                      <span className={styles["toggle-label"]}>
                        {cloudSyncEnabled ? "Cloud Sync Enabled" : "Cloud Sync Disabled"}
                      </span>
                    </div>
                    
                    {cloudSyncEnabled && (
                      <div className={styles["sync-actions"]}>
                        <button 
                          className={`${styles["action-btn"]} ${styles["sync"]}`}
                          onClick={() => {
                            showNotification("Syncing with cloud...", "info");
                            portfolioService.syncLocalToCloud()
                              .then(success => {
                                if (success) {
                                  showNotification("Successfully synced to cloud", "success");
                                } else {
                                  showNotification("Failed to sync to cloud", "error");
                                }
                              })
                              .catch(error => {
                                console.error("Error syncing to cloud:", error);
                                showNotification(`Error syncing: ${error.message}`, "error");
                              });
                          }}
                        >
                          <i className="fas fa-cloud-upload-alt"></i> Push to Cloud
                        </button>
                        <button 
                          className={`${styles["action-btn"]} ${styles["sync"]}`}
                          onClick={() => {
                            showNotification("Pulling from cloud...", "info");
                            portfolioService.syncCloudToLocal()
                              .then(success => {
                                if (success) {
                                  showNotification("Successfully pulled from cloud", "success");
                                  // Refresh UI with new data
                                  const data = portfolioService.getAllData();
                                  data.then(allData => {
                                    setPersonalInfo(allData.personalInfo);
                                    setEducationEntries(allData.education);
                                    setExperienceEntries(allData.experience);
                                    setSkillsData(allData.skills);
                                    setHighlightEntries(allData.highlights);
                                    setProjectEntries(allData.projects);
                                    setPictureEntries(allData.pictures);
                                    setReferenceEntries(allData.references);
                                    setSettingsData(allData.settings);
                                  });
                                } else {
                                  showNotification("Failed to pull from cloud", "error");
                                }
                              })
                              .catch(error => {
                                console.error("Error pulling from cloud:", error);
                                showNotification(`Error pulling: ${error.message}`, "error");
                              });
                          }}
                        >
                          <i className="fas fa-cloud-download-alt"></i> Pull from Cloud
                        </button>
                      </div>
                    )}
                    
                    {cloudSyncEnabled ? (
                      <p className={styles["sync-status-info"]}>
                        <i className="fas fa-info-circle"></i> Your portfolio data is now synchronized across devices and with your live website.
                      </p>
                    ) : (
                      <p className={styles["sync-status-info"]}>
                        <i className="fas fa-info-circle"></i> Enable cloud sync to make real-time updates to your live website.
                      </p>
                    )}
                  </div>
                  
                  <div className={styles["data-export-section"]}>
                    <p>Export your portfolio data to use in production deployment:</p>
                    <button 
                      className={`${styles["action-btn"]} ${styles["export"]}`}
                      onClick={exportPortfolioData}
                    >
                      <i className="fas fa-download"></i> Export Portfolio Data
                    </button>
                    <p className={styles["export-note"]}>
                      After exporting, replace the data in <code>public/production-data.js</code> with your exported data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
