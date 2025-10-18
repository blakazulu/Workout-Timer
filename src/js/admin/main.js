/**
 * Admin Main Entry Point
 * Handles authentication flow and dashboard initialization
 */

import {authenticate, isAuthenticated} from "./auth.js";
import {cleanup, initDashboard} from "./admin-dashboard.js";

// Initialize admin interface
document.addEventListener("DOMContentLoaded", () => {
  console.log("[Admin] Initializing admin interface...");

  // Check authentication status
  if (isAuthenticated()) {
    showDashboard();
  } else {
    showLoginModal();
  }

  // Set up login form
  setupLoginForm();

  // Set up keyboard shortcuts
  setupKeyboardShortcuts();

  // Set up navigation functionality
  setupNavigation();

  // Set up refresh functionality
  setupRefreshButton();

  // Set up logout functionality
  setupLogoutButton();

  // Set up scroll-based navigation highlighting
  setupScrollNavigation();

  // Set up user journey modal
  setupUserJourneyModal();

  // Load sample data
  loadSampleData();

  // Clean up on page unload
  window.addEventListener("beforeunload", cleanup);
});

/**
 * Show the login modal
 */
function showLoginModal() {
  const modal = document.getElementById("login-modal");
  const dashboard = document.getElementById("dashboard-container");

  if (modal) {
    modal.classList.remove("hidden");
  }

  if (dashboard) {
    dashboard.classList.add("hidden");
  }

  // Focus password input
  setTimeout(() => {
    const passwordInput = document.getElementById("password-input");
    if (passwordInput) {
      passwordInput.focus();
    }
  }, 100);
}

/**
 * Show the dashboard
 */
function showDashboard() {
  const modal = document.getElementById("login-modal");
  const dashboard = document.getElementById("dashboard-container");

  if (modal) {
    modal.classList.add("hidden");
  }

  if (dashboard) {
    dashboard.classList.remove("hidden");
  }

  // Initialize dashboard
  initDashboard();
}

/**
 * Set up login form handler
 */
function setupLoginForm() {
  const form = document.getElementById("login-form");
  const passwordInput = document.getElementById("password-input");
  const errorDiv = document.getElementById("login-error");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = passwordInput.value.trim();

    if (!password) {
      showError("Please enter a password");
      passwordInput.setAttribute("aria-invalid", "true");
      passwordInput.focus();
      return;
    }

    // Show loading state with enhanced accessibility
    const submitBtn = form.querySelector("button[type=\"submit\"]");
    const btnText = submitBtn?.querySelector("span");
    const btnLoading = submitBtn?.querySelector(".btn-loading");

    if (submitBtn) {
      submitBtn.classList.add("loading");
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-label", "Authenticating...");
      if (btnText) btnText.style.opacity = "0";
      if (btnLoading) btnLoading.style.opacity = "1";
    }

    // Attempt authentication
    try {
      const success = await authenticate(password);

      if (success) {
        // Clear form and reset states
        passwordInput.value = "";
        passwordInput.setAttribute("aria-invalid", "false");
        hideError();

        // Announce success to screen readers
        announceToScreenReader("Login successful. Loading dashboard...");

        // Show dashboard
        setTimeout(() => {
          showDashboard();
        }, 300);
      } else {
        showError("Invalid password. Please try again.");
        passwordInput.select();
        passwordInput.setAttribute("aria-invalid", "true");
        announceToScreenReader("Login failed. Invalid password.");

        // Re-enable form
        resetFormState();
      }
    } catch (error) {
      console.error("[Admin] Authentication error:", error);
      showError("An error occurred. Please try again.");
      announceToScreenReader("Login error occurred. Please try again.");

      // Re-enable form
      resetFormState();
    }
  });

  function resetFormState() {
    const submitBtn = form.querySelector("button[type=\"submit\"]");
    const btnText = submitBtn?.querySelector("span");
    const btnLoading = submitBtn?.querySelector(".btn-loading");

      if (submitBtn) {
      submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
      submitBtn.setAttribute("aria-label", "Access Dashboard");
      if (btnText) btnText.style.opacity = "1";
      if (btnLoading) btnLoading.style.opacity = "0";
    }
  }

  // Enhanced keyboard navigation
  passwordInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideError();
      passwordInput.setAttribute("aria-invalid", "false");
    }
  });

  // Real-time validation feedback
  passwordInput.addEventListener("input", () => {
    hideError();
    passwordInput.setAttribute("aria-invalid", "false");
  });

  /**
   * Show error message
   */
  function showError(message) {
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove("hidden");
    }
  }

  /**
   * Hide error message
   */
  function hideError() {
    if (errorDiv) {
      errorDiv.classList.add("hidden");
    }
  }
}

/**
 * Set up keyboard shortcuts for enhanced accessibility
 */
function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Only handle shortcuts when not in an input field
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return;
    }

    // Ctrl/Cmd + R: Refresh dashboard
    if ((e.ctrlKey || e.metaKey) && e.key === "r") {
      e.preventDefault();
      const refreshBtn = document.getElementById("refresh-btn");
      if (refreshBtn) {
        refreshBtn.click();
        announceToScreenReader("Dashboard refreshed");
      }
    }

    // Ctrl/Cmd + L: Focus on logout button
    if ((e.ctrlKey || e.metaKey) && e.key === "l") {
      e.preventDefault();
      const logoutBtn = document.getElementById("logout-btn");
      if (logoutBtn) {
        logoutBtn.focus();
        announceToScreenReader("Logout button focused");
      }
    }

    // Escape: Close any open modals or go back
    if (e.key === "Escape") {
      const modal = document.getElementById("login-modal");
      if (modal && !modal.classList.contains("hidden")) {
        // Don't close login modal with Escape for security
        return;
      }

      // Focus on main content
      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        mainContent.focus();
      }
    }
  });
}

/**
 * Set up navigation functionality
 */
function setupNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");
  const sidebar = document.querySelector(".sidebar");
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const sidebarToggle = document.querySelector(".sidebar-toggle");

  // Handle navigation clicks
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Remove active class from all links
      navLinks.forEach(l => l.classList.remove("active"));

      // Add active class to clicked link
      link.classList.add("active");

      // Get the target section
      const href = link.getAttribute("href");
      const targetSection = document.querySelector(href);

      if (targetSection) {
        // Scroll to section with smooth behavior
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

        // Announce to screen readers
        const sectionName = link.querySelector(".nav-text").textContent;
        announceToScreenReader(`Navigated to ${sectionName} section`);
      }

      // Close mobile menu if open
      if (sidebar && sidebar.classList.contains("open")) {
        sidebar.classList.remove("open");
      }
    });
  });

  // Handle mobile menu toggle
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", () => {
      if (sidebar) {
        sidebar.classList.toggle("open");
        const isOpen = sidebar.classList.contains("open");
        mobileMenuToggle.setAttribute("aria-expanded", isOpen);
        announceToScreenReader(isOpen ? "Mobile menu opened" : "Mobile menu closed");
      }
    });
  }

  // Handle sidebar toggle
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      if (sidebar) {
        sidebar.classList.toggle("collapsed");
        const isCollapsed = sidebar.classList.contains("collapsed");
        sidebarToggle.setAttribute("aria-expanded", !isCollapsed);
        announceToScreenReader(isCollapsed ? "Sidebar collapsed" : "Sidebar expanded");
      }
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (sidebar && sidebar.classList.contains("open")) {
      if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        sidebar.classList.remove("open");
        mobileMenuToggle.setAttribute("aria-expanded", "false");
      }
    }
  });
}

/**
 * Set up refresh button functionality
 */
function setupRefreshButton() {
  const refreshBtn = document.getElementById("refresh-btn");
  const refreshOverlay = document.getElementById("refresh-overlay");

  if (refreshBtn && refreshOverlay) {
    refreshBtn.addEventListener("click", async () => {
      // Show refresh overlay
      refreshOverlay.classList.add("show");
      refreshBtn.disabled = true;

      // Announce to screen readers
      announceToScreenReader("Refreshing dashboard data");

      try {
        // Simulate refresh process with minimum 3 seconds
        const startTime = Date.now();
        const minDuration = 3000; // 3 seconds minimum

        // Call the actual refresh function
        await refreshDashboardData();

        // Ensure minimum duration
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDuration - elapsed);

        if (remaining > 0) {
          await new Promise(resolve => setTimeout(resolve, remaining));
        }

      } catch (error) {
        console.error("[Admin] Refresh error:", error);
        announceToScreenReader("Error refreshing data");
      } finally {
        // Hide refresh overlay
        refreshOverlay.classList.remove("show");
        refreshBtn.disabled = false;
        announceToScreenReader("Dashboard data refreshed");
      }
    });
  }
}

/**
 * Set up logout button functionality
 */
function setupLogoutButton() {
  const logoutBtn = document.getElementById("logout-btn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // Confirm logout
      if (confirm("Are you sure you want to sign out?")) {
        // Call logout function
        logout();

        // Announce to screen readers
        announceToScreenReader("Signing out...");

        // Redirect to home page after a short delay
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      }
    });
  }
}

/**
 * Refresh dashboard data
 */
async function refreshDashboardData() {
  try {
    // Import the dashboard refresh function
    const {renderDashboard} = await import("./admin-dashboard.js");

    // Call the refresh function
    await renderDashboard();

    // Update last refresh time
    updateLastRefreshTime();

  } catch (error) {
    console.error("[Admin] Error refreshing dashboard:", error);
    throw error;
  }
}

/**
 * Update last refresh time display
 */
function updateLastRefreshTime() {
  const lastRefreshElement = document.getElementById("last-refresh");
  if (lastRefreshElement) {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    lastRefreshElement.textContent = `Last refreshed: ${timeString}`;
    lastRefreshElement.classList.remove("sr-only");
  }
}

/**
 * Set up scroll-based navigation highlighting
 */
function setupScrollNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");

  // Function to update active nav link based on scroll position
  function updateActiveNavLink() {
    const scrollPos = window.scrollY + 150; // Offset for header

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        // Remove active class from all nav links
        navLinks.forEach(link => link.classList.remove("active"));

        // Add active class to corresponding nav link
        const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        if (activeLink) {
          activeLink.classList.add("active");
        }
      }
    });
  }

  // Update on scroll
  window.addEventListener("scroll", updateActiveNavLink);

  // Update on page load
  updateActiveNavLink();
}

/**
 * Set up user journey modal functionality
 */
function setupUserJourneyModal() {
  const userModal = document.getElementById('user-journey-modal');
  const userModalClose = document.querySelector('.user-modal-close');
  const userModalBackdrop = document.querySelector('.user-modal-backdrop');
  const journeyTabs = document.querySelectorAll('.journey-tab');
  const journeyTabContents = document.querySelectorAll('.journey-tab-content');

  // Close modal functions
  function closeUserModal() {
    if (userModal) {
      userModal.classList.remove('show');
      document.body.style.overflow = '';
      announceToScreenReader('User journey modal closed');
    }
  }

  // Open modal function
  function openUserModal(userData) {
    if (userModal) {
      // Populate user data
      populateUserData(userData);
      
      // Show modal
      userModal.classList.add('show');
      document.body.style.overflow = 'hidden';
      
      // Focus on close button
      setTimeout(() => {
        if (userModalClose) {
          userModalClose.focus();
        }
      }, 100);
      
      announceToScreenReader(`User journey opened for ${userData.name || 'User'}`);
    }
  }

  // Populate user data in modal
  function populateUserData(userData) {
    const userIdDisplay = document.getElementById('user-id-display');
    const userTotalSessions = document.getElementById('user-total-sessions');
    const userTotalTime = document.getElementById('user-total-time');
    const userLastSeen = document.getElementById('user-last-seen');

    if (userIdDisplay) userIdDisplay.textContent = userData.id || 'Unknown';
    if (userTotalSessions) userTotalSessions.textContent = userData.totalSessions || '0';
    if (userTotalTime) userTotalTime.textContent = userData.totalTime || '0h';
    if (userLastSeen) userLastSeen.textContent = userData.lastSeen || 'Never';

    // Populate timeline, sessions, and preferences
    populateUserTimeline(userData.timeline || []);
    populateUserSessions(userData.sessions || []);
    populateUserPreferences(userData.preferences || {});
  }

  // Populate user timeline
  function populateUserTimeline(timeline) {
    const timelineContainer = document.getElementById('user-timeline');
    if (!timelineContainer) return;

    timelineContainer.innerHTML = timeline.map(event => `
      <div class="timeline-event">
        <div class="timeline-icon">
          <i class="ph-fill ph-${event.icon || 'circle'}" aria-hidden="true"></i>
        </div>
        <div class="timeline-content">
          <div class="timeline-title">${event.title || 'Event'}</div>
          <div class="timeline-description">${event.description || 'No description'}</div>
          <div class="timeline-time">${event.time || 'Unknown time'}</div>
        </div>
      </div>
    `).join('');
  }

  // Populate user sessions
  function populateUserSessions(sessions) {
    const sessionsContainer = document.getElementById('user-sessions');
    if (!sessionsContainer) return;

    sessionsContainer.innerHTML = sessions.map(session => `
      <div class="session-item">
        <div class="session-icon">
          <i class="ph-fill ph-play" aria-hidden="true"></i>
        </div>
        <div class="session-content">
          <div class="session-title">${session.title || 'Workout Session'}</div>
          <div class="session-description">${session.description || 'No description'}</div>
          <div class="session-time">${session.duration || 'Unknown duration'}</div>
        </div>
      </div>
    `).join('');
  }

  // Populate user preferences
  function populateUserPreferences(preferences) {
    const preferencesContainer = document.getElementById('user-preferences');
    if (!preferencesContainer) return;

    const prefs = Object.entries(preferences).map(([key, value]) => `
      <div class="preference-item">
        <div class="preference-icon">
          <i class="ph-fill ph-heart" aria-hidden="true"></i>
        </div>
        <div class="preference-content">
          <div class="preference-title">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
          <div class="preference-description">${value}</div>
        </div>
      </div>
    `).join('');

    preferencesContainer.innerHTML = prefs || '<div class="preference-item"><div class="preference-content"><div class="preference-title">No preferences available</div></div></div>';
  }

  // Event listeners
  if (userModalClose) {
    userModalClose.addEventListener('click', closeUserModal);
  }

  if (userModalBackdrop) {
    userModalBackdrop.addEventListener('click', closeUserModal);
  }

  // Journey tab switching
  journeyTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      
      // Remove active class from all tabs and contents
      journeyTabs.forEach(t => t.classList.remove('active'));
      journeyTabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      const targetContent = document.getElementById(`${targetTab}-tab`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
      
      announceToScreenReader(`Switched to ${tab.textContent.trim()} tab`);
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (userModal && userModal.classList.contains('show')) {
      if (e.key === 'Escape') {
        closeUserModal();
      }
    }
  });

  // Make openUserModal globally available
  window.openUserModal = openUserModal;
}

/**
 * Load sample data for analytics sections
 */
function loadSampleData() {
  // Sample users data
  const sampleUsers = [
    {
      id: 'user_001',
      name: 'Alex Johnson',
      status: 'active',
      lastSeen: '2 hours ago',
      totalSessions: 45,
      totalTime: '12h 30m',
      timeline: [
        { icon: 'play', title: 'Started Workout', description: 'High-intensity cardio session', time: '2 hours ago' },
        { icon: 'heart', title: 'Favorited Song', description: 'Added "Eye of the Tiger" to favorites', time: '3 hours ago' },
        { icon: 'timer', title: 'Completed Session', description: 'Finished 30-minute workout', time: '1 day ago' }
      ],
      sessions: [
        { title: 'Morning Cardio', description: 'High-intensity interval training', duration: '30 min' },
        { title: 'Evening Strength', description: 'Upper body strength training', duration: '45 min' }
      ],
      preferences: {
        favoriteGenre: 'Electronic',
        workoutDuration: '30-45 minutes',
        musicVolume: 'High'
      }
    },
    {
      id: 'user_002',
      name: 'Sarah Chen',
      status: 'active',
      lastSeen: '1 hour ago',
      totalSessions: 32,
      totalTime: '8h 15m',
      timeline: [
        { icon: 'music-notes', title: 'Changed Genre', description: 'Switched to Rock music', time: '1 hour ago' },
        { icon: 'play', title: 'Started Workout', description: 'Yoga session', time: '2 hours ago' }
      ],
      sessions: [
        { title: 'Yoga Flow', description: 'Gentle yoga practice', duration: '25 min' },
        { title: 'Meditation', description: 'Mindfulness meditation', duration: '15 min' }
      ],
      preferences: {
        favoriteGenre: 'Rock',
        workoutDuration: '20-30 minutes',
        musicVolume: 'Medium'
      }
    },
    {
      id: 'user_003',
      name: 'Mike Rodriguez',
      status: 'inactive',
      lastSeen: '3 days ago',
      totalSessions: 18,
      totalTime: '6h 45m',
      timeline: [
        { icon: 'timer', title: 'Completed Session', description: 'Full body workout', time: '3 days ago' },
        { icon: 'heart', title: 'Favorited Song', description: 'Added "Stronger" to favorites', time: '5 days ago' }
      ],
      sessions: [
        { title: 'Full Body HIIT', description: 'High-intensity full body workout', duration: '40 min' }
      ],
      preferences: {
        favoriteGenre: 'Pop',
        workoutDuration: '35-45 minutes',
        musicVolume: 'High'
      }
    }
  ];

  // Sample events data
  const sampleEvents = [
    {
      id: 'event_001',
      name: 'Session Started',
      type: 'session',
      status: 'active',
      time: '2 hours ago',
      description: 'User started a new workout session'
    },
    {
      id: 'event_002',
      name: 'Music Changed',
      type: 'music',
      status: 'active',
      time: '3 hours ago',
      description: 'User changed music genre to Electronic'
    },
    {
      id: 'event_003',
      name: 'Session Completed',
      type: 'session',
      status: 'completed',
      time: '1 day ago',
      description: 'User completed a 30-minute workout'
    }
  ];

  // Populate users table
  populateUsersTable(sampleUsers);
  
  // Populate events table
  populateEventsTable(sampleEvents);
  
  // Update stats
  updateAnalyticsStats(sampleUsers, sampleEvents);
}

/**
 * Populate users table
 */
function populateUsersTable(users) {
  const usersTable = document.getElementById('users-table');
  if (!usersTable) return;

  usersTable.innerHTML = users.map(user => `
    <div class="user-row" onclick="openUserModal(${JSON.stringify(user).replace(/"/g, '&quot;')})">
      <div class="user-avatar">
        <i class="ph-fill ph-user" aria-hidden="true"></i>
      </div>
      <div class="user-info">
        <div class="user-name">${user.name}</div>
        <div class="user-details">
          <span class="user-status ${user.status}">${user.status}</span>
          <span class="user-time">${user.lastSeen}</span>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Populate events table
 */
function populateEventsTable(events) {
  const eventsTable = document.getElementById('events-table');
  if (!eventsTable) return;

  eventsTable.innerHTML = events.map(event => `
    <div class="event-row">
      <div class="event-icon">
        <i class="ph-fill ph-${event.type === 'session' ? 'play' : 'music-notes'}" aria-hidden="true"></i>
      </div>
      <div class="event-info">
        <div class="event-name">${event.name}</div>
        <div class="event-details">
          <span class="event-status ${event.status}">${event.status}</span>
          <span class="event-time">${event.time}</span>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Update analytics stats
 */
function updateAnalyticsStats(users, events) {
  const totalUsers = document.getElementById('total-users-count');
  const activeUsers = document.getElementById('active-users-count');
  const newUsers = document.getElementById('new-users-count');
  const totalEvents = document.getElementById('total-events-count');
  const sessionEvents = document.getElementById('session-events-count');
  const musicEvents = document.getElementById('music-events-count');

  if (totalUsers) totalUsers.textContent = users.length;
  if (activeUsers) activeUsers.textContent = users.filter(u => u.status === 'active').length;
  if (newUsers) newUsers.textContent = Math.floor(users.length * 0.3); // Simulate new users
  if (totalEvents) totalEvents.textContent = events.length;
  if (sessionEvents) sessionEvents.textContent = events.filter(e => e.type === 'session').length;
  if (musicEvents) musicEvents.textContent = events.filter(e => e.type === 'music').length;
}

/**
 * Announce messages to screen readers
 */
function announceToScreenReader(message) {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", "polite");
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, 1000);
}
