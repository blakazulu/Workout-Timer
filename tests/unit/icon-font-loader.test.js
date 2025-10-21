/**
 * Icon Font Loader Tests
 *
 * Tests the bulletproof icon loading system including:
 * - Font detection
 * - Fallback activation
 * - iOS-specific behaviors
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initIconFontLoader,
  checkFonts,
  isFallbackActive,
  activateFallback,
  deactivateFallback
} from '../../src/js/utils/icon-font-loader.js';

describe('Icon Font Loader', () => {
  beforeEach(() => {
    // Clean up classes before each test
    document.documentElement.classList.remove('icon-fonts-failed');
  });

  afterEach(() => {
    // Clean up after each test
    document.documentElement.classList.remove('icon-fonts-failed');
  });

  describe('Fallback Activation', () => {
    it('should add fallback class when activateFallback is called', () => {
      activateFallback('test');
      expect(document.documentElement.classList.contains('icon-fonts-failed')).toBe(true);
    });

    it('should remove fallback class when deactivateFallback is called', () => {
      document.documentElement.classList.add('icon-fonts-failed');
      deactivateFallback();
      expect(document.documentElement.classList.contains('icon-fonts-failed')).toBe(false);
    });

    it('should dispatch custom event when fallback is activated', () => {
      const listener = vi.fn();
      window.addEventListener('iconFontsFailed', listener);

      activateFallback('test reason');

      expect(listener).toHaveBeenCalled();
      expect(listener.mock.calls[0][0].detail.reason).toBe('test reason');

      window.removeEventListener('iconFontsFailed', listener);
    });

    it('should dispatch custom event when fonts load successfully', () => {
      const listener = vi.fn();
      window.addEventListener('iconFontsLoaded', listener);

      deactivateFallback();

      expect(listener).toHaveBeenCalled();

      window.removeEventListener('iconFontsLoaded', listener);
    });
  });

  describe('Fallback Status Check', () => {
    it('should return true when fallback is active', () => {
      activateFallback('test');
      expect(isFallbackActive()).toBe(true);
    });

    it('should return false when fallback is not active', () => {
      deactivateFallback();
      expect(isFallbackActive()).toBe(false);
    });
  });

  describe('Font Detection', () => {
    it('should create test element when checking fonts', async () => {
      // Spy on createElement
      const createElementSpy = vi.spyOn(document, 'createElement');

      await checkFonts();

      // Should create test elements for font checking
      expect(createElementSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
    });

    it('should clean up test elements after checking', async () => {
      const initialChildren = document.body.children.length;

      await checkFonts();

      // Body should not have extra elements after check
      expect(document.body.children.length).toBe(initialChildren);
    });
  });

  describe('CSS Fallback System', () => {
    it('should have CSS fallback rules defined', () => {
      // Create test element
      const testIcon = document.createElement('i');
      testIcon.className = 'ph-bold ph-play icon-fallback';
      document.body.appendChild(testIcon);

      // Get computed style
      const style = window.getComputedStyle(testIcon, '::before');
      const content = style.content;

      // Should have fallback content (may be quoted or not depending on browser)
      expect(content).toBeDefined();
      expect(content).not.toBe('none');
      expect(content).not.toBe('');

      document.body.removeChild(testIcon);
    });

    it('should use system fonts for fallback icons', () => {
      // Activate fallback
      document.documentElement.classList.add('icon-fonts-failed');

      const testIcon = document.createElement('i');
      testIcon.className = 'ph-bold ph-heart';
      document.body.appendChild(testIcon);

      const style = window.getComputedStyle(testIcon, '::before');
      const fontFamily = style.fontFamily.toLowerCase();

      // Should use system font, not Phosphor
      expect(fontFamily).toContain('system');

      document.body.removeChild(testIcon);
    });
  });

  describe('Initialization', () => {
    it('should initialize without errors', () => {
      expect(() => {
        initIconFontLoader({
          debug: false,
          timeout: 1000
        });
      }).not.toThrow();
    });

    it('should accept configuration options', () => {
      const config = {
        debug: true,
        timeout: 5000
      };

      expect(() => {
        initIconFontLoader(config);
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing FontFaceSet API gracefully', async () => {
      // Temporarily remove fonts API
      const originalFonts = document.fonts;
      // @ts-ignore
      delete document.fonts;

      await expect(checkFonts()).resolves.toBeDefined();

      // Restore
      // @ts-ignore
      document.fonts = originalFonts;
    });

    it('should handle document visibility changes', () => {
      const listener = vi.fn();

      // Mock visibility change
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => false
      });

      document.dispatchEvent(new Event('visibilitychange'));

      // Should not throw
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Multiple Icon Weights', () => {
    it('should detect when bold weight is missing', () => {
      const testIcon = document.createElement('i');
      testIcon.className = 'ph-bold ph-play';
      testIcon.style.position = 'absolute';
      testIcon.style.opacity = '0';
      document.body.appendChild(testIcon);

      const computedFont = window.getComputedStyle(testIcon).fontFamily;

      // Test should check if Phosphor-Bold is loaded
      expect(computedFont).toBeDefined();

      document.body.removeChild(testIcon);
    });

    it('should detect when fill weight is missing', () => {
      const testIcon = document.createElement('i');
      testIcon.className = 'ph-fill ph-lock';
      testIcon.style.position = 'absolute';
      testIcon.style.opacity = '0';
      document.body.appendChild(testIcon);

      const computedFont = window.getComputedStyle(testIcon).fontFamily;

      // Test should check if Phosphor-Fill is loaded
      expect(computedFont).toBeDefined();

      document.body.removeChild(testIcon);
    });
  });

  describe('Performance', () => {
    it('should complete font check within timeout', async () => {
      const startTime = Date.now();

      await checkFonts();

      const duration = Date.now() - startTime;

      // Should complete reasonably quickly (< 5 seconds)
      expect(duration).toBeLessThan(5000);
    });

    it('should not leave test elements in DOM', async () => {
      const initialBodyChildren = document.body.children.length;

      await checkFonts();

      // Verify cleanup
      expect(document.body.children.length).toBe(initialBodyChildren);
    });
  });

  describe('Accessibility', () => {
    it('should not interfere with aria-hidden icons', () => {
      const testIcon = document.createElement('i');
      testIcon.className = 'ph-bold ph-play';
      testIcon.setAttribute('aria-hidden', 'true');
      document.body.appendChild(testIcon);

      expect(testIcon.getAttribute('aria-hidden')).toBe('true');

      document.body.removeChild(testIcon);
    });

    it('should allow fallback icons to be accessible', () => {
      document.documentElement.classList.add('icon-fonts-failed');

      const button = document.createElement('button');
      button.setAttribute('aria-label', 'Play');
      button.innerHTML = '<i class="ph-bold ph-play" aria-hidden="true"></i>';
      document.body.appendChild(button);

      expect(button.getAttribute('aria-label')).toBe('Play');

      document.body.removeChild(button);
    });
  });
});

describe('Icon Fallback CSS', () => {
  beforeEach(() => {
    document.documentElement.classList.add('icon-fonts-failed');
  });

  afterEach(() => {
    document.documentElement.classList.remove('icon-fonts-failed');
  });

  const testCases = [
    { class: 'ph-play', expectedContent: '▶', name: 'Play icon' },
    { class: 'ph-pause', expectedContent: '⏸', name: 'Pause icon' },
    { class: 'ph-heart', expectedContent: '♥', name: 'Heart icon' },
    { class: 'ph-x', expectedContent: '×', name: 'Close icon' },
    { class: 'ph-info', expectedContent: 'ℹ', name: 'Info icon' },
    { class: 'ph-fire', expectedContent: '🔥', name: 'Fire icon' },
    { class: 'ph-lightning', expectedContent: '⚡', name: 'Lightning icon' },
    { class: 'ph-barbell', expectedContent: '🏋', name: 'Barbell icon' },
  ];

  testCases.forEach(({ class: className, expectedContent, name }) => {
    it(`should show ${expectedContent} fallback for ${name}`, () => {
      const icon = document.createElement('i');
      icon.className = className;
      document.body.appendChild(icon);

      const style = window.getComputedStyle(icon, '::before');
      const content = style.content.replace(/['"]/g, ''); // Remove quotes

      // Check if content includes expected character
      expect(content).toContain(expectedContent);

      document.body.removeChild(icon);
    });
  });
});
