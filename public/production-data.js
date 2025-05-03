// This file contains your portfolio data for production deployment
// The data here will be loaded automatically when your site is deployed to Netlify

window.PORTFOLIO_PRODUCTION_DATA = {
  personalInfo: {
    name: "Fahim Faysal",
    jobTitle: "Web Developer",
    introText: "Passionate web developer with expertise in React and modern web technologies.",
    bio: "I am a full-stack developer with over 5 years of experience building web applications.",
    email: "fahim.faysal@example.com", // Replace with your actual email
    phone: "+880 1234567890", // Replace with your actual phone
    location: "Dhaka, Bangladesh",
    website: "https://fahim-faysal.netlify.app",
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/fahim-faysal-6a6425253",
      github: "https://github.com/fahim-faysal",
      twitter: "https://twitter.com/fahim_faysal",
      instagram: "https://instagram.com/fahim_faysal",
    },
    hero: {
      greeting: "Hello, I'm",
      description: "Passionate web developer with expertise in React and modern web technologies. I create responsive and user-friendly web applications.",
      stats: [
        { value: "5+", label: "Years Experience" },
        { value: "100+", label: "Projects Completed" },
        { value: "50+", label: "Happy Clients" },
      ],
      buttonText: "Get In Touch",
      profileImageUrl: "/profile.jpg", // Make sure this image exists in your public folder
    },
    aboutImageUrl: "/about-me.jpg", // Make sure this image exists in your public folder
  },
  education: [
    {
      degree: "Bachelor of Computer Science",
      field: "Software Engineering",
      institution: "Dhaka University",
      location: "Dhaka, Bangladesh",
      startDate: "2018-09",
      endDate: "2022-06",
      current: false,
      description: "Studied computer science with focus on software engineering and web development. Participated in several coding competitions and hackathons.",
    },
    {
      degree: "Web Development Bootcamp",
      field: "Full Stack Development",
      institution: "Tech Academy",
      location: "Dhaka, Bangladesh",
      startDate: "2022-07",
      endDate: "2022-12",
      current: false,
      description: "Intensive bootcamp covering modern web development technologies including React, Node.js, and database design.",
    }
  ],
  experience: [
    {
      position: "Senior Web Developer",
      company: "Tech Solutions BD",
      location: "Dhaka, Bangladesh",
      period: "2021 - Present",
      description: "Lead developer for multiple enterprise-level web applications. Managed a team of five developers and collaborated with design and product teams.",
    },
    {
      position: "Junior Developer",
      company: "Creative IT",
      location: "Dhaka, Bangladesh",
      period: "2018 - 2021",
      description: "Developed responsive websites and e-commerce solutions for various clients. Implemented modern front-end technologies and best practices.",
    }
  ],
  skills: {
    technical: [
      { name: "React", level: "advanced" },
      { name: "HTML", level: "expert" },
      { name: "CSS", level: "expert" },
      { name: "JavaScript", level: "advanced" },
      { name: "Node.js", level: "intermediate" },
      { name: "MongoDB", level: "intermediate" },
      { name: "Git", level: "advanced" },
    ],
    soft: [
      { name: "Communication" },
      { name: "Teamwork" },
      { name: "Problem Solving" },
      { name: "Project Management" },
      { name: "Time Management" },
    ],
    languages: [
      { name: "Bengali", level: "native" },
      { name: "English", level: "advanced" },
    ],
  },
  projects: [
    {
      title: "E-commerce Platform",
      category: "Web Development",
      description: "A full-featured e-commerce platform with product management, cart functionality, and secure checkout integration.",
      image: "/projects/ecommerce.jpg", // Replace with your actual image path
      demoUrl: "https://example-ecommerce.netlify.app",
      repoUrl: "https://github.com/fahim-faysal/ecommerce",
      date: "2023-03",
      technologies: "React, Node.js, MongoDB, Stripe",
    },
    {
      title: "Portfolio Website",
      category: "Web Development",
      description: "A responsive portfolio website with modern design and custom admin panel.",
      image: "/projects/portfolio.jpg", // Replace with your actual image path
      demoUrl: "https://fahim-faysal.netlify.app",
      repoUrl: "https://github.com/fahim-faysal/portfolio",
      date: "2023-05",
      technologies: "React, CSS Modules, Vite",
    }
  ],
  highlights: [
    {
      title: "Best Web Application Award",
      date: "2023-05",
      category: "award",
      description: "Received industry recognition for developing an innovative user interface that increased customer engagement by 45%.",
    },
    {
      title: "Tech Conference Speaker",
      date: "2022-11",
      category: "presentation",
      description: "Presented on modern React development practices at the annual Bangladesh Tech Summit.",
    }
  ],
  pictures: [
    {
      title: "Web Design Project",
      category: "Work",
      image: "/gallery/design1.jpg", // Replace with your actual image path
      description: "UI/UX design for a finance application dashboard.",
      link: "#",
    },
    {
      title: "Mobile App Interface",
      category: "Design",
      image: "/gallery/design2.jpg", // Replace with your actual image path
      description: "Mobile application interface design for a health tracking app.",
      link: "#",
    }
  ],
  references: [
    {
      name: "Ahmed Khan",
      position: "CTO",
      company: "Tech Solutions BD",
      image: "/references/ahmed.jpg", // Replace with your actual image path
      quote: "Fahim is an exceptional developer who consistently delivered high-quality work on all of our projects. His technical skills, problem-solving abilities, and communication made him an invaluable asset to our team.",
    },
    {
      name: "Nusrat Jahan",
      position: "Project Manager",
      company: "Creative IT",
      image: "/references/nusrat.jpg", // Replace with your actual image path
      quote: "Working with Fahim was a pleasure. His attention to detail and ability to meet deadlines made him one of our most reliable team members.",
    }
  ],
  settings: {
    portfolioTitle: "Fahim Faysal - Web Developer",
    faviconUrl: "/favicon.ico",
    accentColor: "#4a90e2",
    secondaryColor: "#50e3c2",
    metaDescription: "Portfolio of Fahim Faysal, a Web Developer specializing in React, Node.js, and modern web technologies.",
    auth: {
      username: "admin",
      email: "admin@example.com",
      passwordHash: "MTIzNA==", // Base64 encoded "1234"
    },
  },
}; 