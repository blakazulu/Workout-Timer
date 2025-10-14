/**
 * Tooltip Handler Module
 * Setup music tooltip positioning (fallback for browsers without anchor positioning)
 * Modern browsers with anchor positioning + position-try-fallbacks handle this automatically
 */

import { $ } from "../utils/dom.js";

/**
 * Set up music tooltip positioning
 */
export function setupMusicTooltipPositioning() {
  const musicInfoBtn = $("#musicInfoBtn");
  const musicTooltip = $("#musicTooltip");

  if (!musicInfoBtn || !musicTooltip) return;

  // Check if anchor positioning is supported
  const supportsAnchorPositioning = CSS.supports("anchor-name", "--test");

  if (!supportsAnchorPositioning) {
    console.log("Using JavaScript fallback for tooltip positioning (anchor positioning not supported)");

    const positionTooltip = () => {
      const rect = musicInfoBtn.getBoundingClientRect();
      const tooltipRect = musicTooltip.getBoundingClientRect();
      const margin = 10;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Simple positioning: centered below button, with basic viewport checks
      let top = rect.bottom + 8;
      let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);

      // Keep within viewport bounds
      left = Math.max(margin, Math.min(left, viewportWidth - tooltipRect.width - margin));

      // Position above if no space below
      if (top + tooltipRect.height > viewportHeight - margin) {
        top = rect.top - tooltipRect.height - 8;
      }

      musicTooltip.style.left = `${left}px`;
      musicTooltip.style.top = `${top}px`;
    };

    // Position on toggle
    musicTooltip.addEventListener("toggle", (e) => {
      if (e.newState === "open") {
        requestAnimationFrame(() => positionTooltip());
      }
    });

    // Reposition on scroll/resize
    window.addEventListener("scroll", () => {
      if (musicTooltip.matches(":popover-open")) {
        positionTooltip();
      }
    });

    window.addEventListener("resize", () => {
      if (musicTooltip.matches(":popover-open")) {
        positionTooltip();
      }
    });
  }
}
