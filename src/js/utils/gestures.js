/**
 * Touch Gesture Utilities for Mobile UX
 */

export class GestureHandler {
  constructor(element) {
    this.element = element
    this.touchStartX = 0
    this.touchStartY = 0
    this.touchEndX = 0
    this.touchEndY = 0
    this.minSwipeDistance = 50
    this.handlers = {
      swipeLeft: null,
      swipeRight: null,
      swipeUp: null,
      swipeDown: null,
      tap: null,
      doubleTap: null
    }
    this.lastTap = 0
    this.doubleTapDelay = 300

    this.init()
  }

  /**
   * Initialize touch event listeners
   */
  init() {
    if (!this.element) return

    this.element.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true })
    this.element.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true })
  }

  /**
   * Handle touch start
   * @param {TouchEvent} e
   */
  handleTouchStart(e) {
    this.touchStartX = e.changedTouches[0].screenX
    this.touchStartY = e.changedTouches[0].screenY
  }

  /**
   * Handle touch end
   * @param {TouchEvent} e
   */
  handleTouchEnd(e) {
    this.touchEndX = e.changedTouches[0].screenX
    this.touchEndY = e.changedTouches[0].screenY

    this.handleGesture()
  }

  /**
   * Determine and execute gesture
   */
  handleGesture() {
    const deltaX = this.touchEndX - this.touchStartX
    const deltaY = this.touchEndY - this.touchStartY
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // Check for tap or double tap
    if (absDeltaX < 10 && absDeltaY < 10) {
      const currentTime = new Date().getTime()
      const tapLength = currentTime - this.lastTap

      if (tapLength < this.doubleTapDelay && tapLength > 0) {
        // Double tap
        if (this.handlers.doubleTap) {
          this.handlers.doubleTap()
        }
        this.lastTap = 0
      } else {
        // Single tap
        if (this.handlers.tap) {
          this.handlers.tap()
        }
        this.lastTap = currentTime
      }
      return
    }

    // Check for swipe gestures
    if (absDeltaX > this.minSwipeDistance || absDeltaY > this.minSwipeDistance) {
      // Determine primary direction
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0 && this.handlers.swipeRight) {
          this.handlers.swipeRight()
        } else if (deltaX < 0 && this.handlers.swipeLeft) {
          this.handlers.swipeLeft()
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && this.handlers.swipeDown) {
          this.handlers.swipeDown()
        } else if (deltaY < 0 && this.handlers.swipeUp) {
          this.handlers.swipeUp()
        }
      }
    }
  }

  /**
   * Register a gesture handler
   * @param {string} gesture - Gesture type
   * @param {Function} callback - Callback function
   */
  on(gesture, callback) {
    if (this.handlers.hasOwnProperty(gesture)) {
      this.handlers[gesture] = callback
    }
  }

  /**
   * Remove all gesture handlers
   */
  destroy() {
    this.element.removeEventListener('touchstart', this.handleTouchStart)
    this.element.removeEventListener('touchend', this.handleTouchEnd)
  }
}

/**
 * Create a gesture handler for an element
 * @param {Element} element - Target element
 * @returns {GestureHandler}
 */
export function createGestureHandler(element) {
  return new GestureHandler(element)
}
