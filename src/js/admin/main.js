/**
 * Admin Main Entry Point
 * Handles authentication flow and dashboard initialization
 */

import { isAuthenticated, authenticate } from './auth.js';
import { initDashboard, cleanup } from './admin-dashboard.js';

// Initialize admin interface
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Admin] Initializing admin interface...');

  // Check authentication status
  if (isAuthenticated()) {
    showDashboard();
  } else {
    showLoginModal();
  }

  // Set up login form
  setupLoginForm();

  // Clean up on page unload
  window.addEventListener('beforeunload', cleanup);
});

/**
 * Show the login modal
 */
function showLoginModal() {
  const modal = document.getElementById('login-modal');
  const dashboard = document.getElementById('dashboard-container');

  if (modal) {
    modal.classList.remove('hidden');
  }

  if (dashboard) {
    dashboard.classList.add('hidden');
  }

  // Focus password input
  setTimeout(() => {
    const passwordInput = document.getElementById('password-input');
    if (passwordInput) {
      passwordInput.focus();
    }
  }, 100);
}

/**
 * Show the dashboard
 */
function showDashboard() {
  const modal = document.getElementById('login-modal');
  const dashboard = document.getElementById('dashboard-container');

  if (modal) {
    modal.classList.add('hidden');
  }

  if (dashboard) {
    dashboard.classList.remove('hidden');
  }

  // Initialize dashboard
  initDashboard();
}

/**
 * Set up login form handler
 */
function setupLoginForm() {
  const form = document.getElementById('login-form');
  const passwordInput = document.getElementById('password-input');
  const errorDiv = document.getElementById('login-error');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = passwordInput.value.trim();

    if (!password) {
      showError('Please enter a password');
      return;
    }

    // Disable form during authentication
    form.classList.add('loading');
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Authenticating...';
    }

    // Attempt authentication
    try {
      const success = await authenticate(password);

      if (success) {
        // Clear form
        passwordInput.value = '';
        hideError();

        // Show dashboard
        setTimeout(() => {
          showDashboard();
        }, 300);
      } else {
        showError('Invalid password. Please try again.');
        passwordInput.select();

        // Re-enable form
        form.classList.remove('loading');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="ph ph-sign-in"></i> Login';
        }
      }
    } catch (error) {
      console.error('[Admin] Authentication error:', error);
      showError('An error occurred. Please try again.');

      // Re-enable form
      form.classList.remove('loading');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="ph ph-sign-in"></i> Login';
      }
    }
  });

  /**
   * Show error message
   */
  function showError(message) {
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove('hidden');
    }
  }

  /**
   * Hide error message
   */
  function hideError() {
    if (errorDiv) {
      errorDiv.classList.add('hidden');
    }
  }
}
